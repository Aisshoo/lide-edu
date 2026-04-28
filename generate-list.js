/**
 * author 金保虎（Aisshoo Adolf Kinyong）
 * created on 23-04-2026-19h-21m
 * github: https://gitee.com/aisshoo
 * copyright 2026
*/
// generate-list.js - 自动扫描paper目录并生成paper/list.json
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  articleDir: './paper',               // 文章目录
  outputFile: './paper/list.json',     // 输出文件，修改为paper目录下
  pageSize: 15,                        // 每页显示数量
  // 类型映射
  typeMap: {
    xlfd: '心理辅导',
    xwjz: '行为矫正',
    whsy: '文化素养',
    jqtg: '坚强体格',
    xyfc: '学员风采',
  },
  // 文件命名模式: teaching_类型_YYYYMMDD.html
  filePattern: /^teaching_([a-z]+)_(\d{8})\.html$/i
};

// 主函数
async function generateIndex() {
  console.log('🚀 开始扫描教学教研文章目录...');
  console.log(`📁 扫描目录: ${path.resolve(CONFIG.articleDir)}`);
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(CONFIG.articleDir)) {
      console.error(`❌ 错误: 目录 ${CONFIG.articleDir} 不存在`);
      console.log('📂 正在创建目录...');
      fs.mkdirSync(CONFIG.articleDir, { recursive: true });
      console.log('✅ 目录创建完成，请将HTML文件放入paper/目录中');
      return;
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(CONFIG.articleDir);
    console.log(`📄 找到 ${files.length} 个文件`);
    
    if (files.length === 0) {
      console.log('ℹ️  paper目录为空，请添加文章HTML文件');
      console.log('📝 文件命名格式: teaching_xlfd_20231026.html');
      console.log('   支持的类型: xlfd(心理辅导), xwjz(行为矫正), whsy(文化素养), jqtg(坚强体格), xyfc(学员风采)');
    }
    
    // 过滤和分析HTML文件
    const articles = [];
    let skippedFiles = 0;
    
    for (const filename of files) {
      const match = filename.match(CONFIG.filePattern);
      
      if (!match) {
        if (filename !== '.gitkeep' && !filename.startsWith('.')) {
          console.log(`⏭️  跳过: ${filename} (不符合命名规范)`);
          skippedFiles++;
        }
        continue;
      }
      
      const [, type, dateStr] = match;
      
      // 检查类型是否有效
      if (!CONFIG.typeMap[type]) {
        console.log(`⚠️  跳过: ${filename} (未知类型: ${type})`);
        skippedFiles++;
        continue;
      }
      
      // 解析日期
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const date = `${year}-${month}-${day}`;
      const timestamp = new Date(`${year}-${month}-${day}`).getTime();
      
      // 读取HTML文件，提取标题
      const filePath = path.join(CONFIG.articleDir, filename);
      let title = '';
      
      try {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        
        // 提取标题 - 优先从article-title中获取
        const titleMatch = htmlContent.match(/<h1\s+class="article-title"[^>]*>(.*?)<\/h1>/si);
        
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1]
            .replace(/\s+/g, ' ')
            .trim();
        } else {
          // 如果找不到article-title，尝试从title标签获取
          const fallbackMatch = htmlContent.match(/<title>(.*?)<\/title>/si);
          title = fallbackMatch 
            ? fallbackMatch[1].trim()
            : filename.replace('.html', '').replace(/_/g, ' ');
        }
      } catch (readError) {
        console.log(`❌ 读取失败: ${filename} - ${readError.message}`);
        title = `文件读取错误: ${filename}`;
      }
      
      // 添加文章信息
      articles.push({
        filename: filename,
        url: `paper/${filename}`,
        type: type,
        typeName: CONFIG.typeMap[type],
        date: date,
        timestamp: timestamp,
        sortDate: dateStr, // 用于排序的日期字符串
        title: title,
        summary: title.substring(0, 100) + '...' // 简单摘要
      });
      
      console.log(`✅ 已添加: ${filename} (${CONFIG.typeMap[type]}) - "${title.substring(0, 40)}${title.length > 40 ? '...' : ''}"`);
    }
    
    if (articles.length === 0) {
      console.log('⚠️  警告: 没有找到符合格式的文章文件');
      console.log('\n📋 文件命名要求:');
      console.log('   teaching_类型_YYYYMMDD.html');
      console.log('   支持的类型:');
      Object.entries(CONFIG.typeMap).forEach(([key, value]) => {
        if (key !== 'all') {
          console.log(`     ${key}: ${value}`);
        }
      });
      console.log('   例如: teaching_xlfd_20231026.html');
    }
    
    // 按日期倒序排序（最新在前）
    articles.sort((a, b) => b.timestamp - a.timestamp);
    
    // 创建统计信息
    const stats = {
      success: true,
      total: articles.length,
      pageSize: CONFIG.pageSize,
      totalPages: Math.ceil(articles.length / CONFIG.pageSize),
      generated: new Date().toLocaleString('zh-CN'),
      byType: {},
      skippedFiles: skippedFiles
    };
    
    // 按类型统计
    Object.keys(CONFIG.typeMap).forEach(type => {
      if (type !== 'all') {
        stats.byType[type] = articles.filter(a => a.type === type).length;
      }
    });
    
    // 构建最终数据结构
    const result = {
      metadata: stats,
      articles: articles
    };
    
    // 确保输出目录存在
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入JSON文件
    fs.writeFileSync(
      CONFIG.outputFile, 
      JSON.stringify(result, null, 2), 
      'utf8'
    );
    
    console.log('\n🎉 索引生成完成!');
    console.log(`📁 输出文件: ${path.resolve(CONFIG.outputFile)}`);
    console.log(`📄 有效文章: ${articles.length}篇`);
    console.log(`📄 跳过文件: ${skippedFiles}个`);
    console.log(`📄 总页数: ${stats.totalPages}页(每页${CONFIG.pageSize}条)`);
    console.log('\n📊 按类型统计:');
    Object.entries(CONFIG.typeMap).forEach(([key, value]) => {
      if (key !== 'all') {
        console.log(`   ${value}: ${stats.byType[key] || 0}篇`);
      }
    });
    
    // 显示最近的文章
    if (articles.length > 0) {
      console.log('\n📰 最新5篇文章:');
      articles.slice(0, 5).forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.date} [${article.typeName}] ${article.title.substring(0, 30)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ 生成索引时出错:', error.message);
    
    // 创建错误信息文件
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    try {
      const outputDir = path.dirname(CONFIG.outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(errorResult, null, 2), 'utf8');
    } catch (writeError) {
      console.error('❌ 写入错误文件失败:', writeError.message);
    }
  }
}

// 创建示例文章文件
function createSampleArticles() {
  const sampleArticles = [
    { type: 'xlfd', date: '20231026', title: '立德精英素质教育基地践行新时代学生心理健康工作' },
    { type: 'xlfd', date: '20231115', title: '心理辅导在青少年成长中的重要作用' },
    { type: 'xwjz', date: '20231210', title: '行为矫正教育的创新实践' },
    { type: 'xwjz', date: '20240120', title: '学生行为习惯培养的有效方法' },
    { type: 'whsy', date: '20240228', title: '传统文化在素质教育中的融入' },
    { type: 'whsy', date: '20240315', title: '提升学生文化素养的途径探索' },
    { type: 'jqtg', date: '20240410', title: '体育锻炼对学生体质健康的影响' },
    { type: 'jqtg', date: '20240505', title: '校园体育活动的组织与实施' },
    { type: 'xyfc', date: '20240620', title: '优秀学员成长故事分享' },
    { type: 'xyfc', date: '20240718', title: '学员风采展示活动纪实' }
  ];
  
  console.log('\n📝 创建教学教研示例文件...');
  
  // 确保目录存在
  if (!fs.existsSync(CONFIG.articleDir)) {
    fs.mkdirSync(CONFIG.articleDir, { recursive: true });
  }
  
  sampleArticles.forEach(article => {
    const filename = `teaching_${article.type}_${article.date}.html`;
    const filePath = path.join(CONFIG.articleDir, filename);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - 教学教研</title>
    <style>
        body { font-family: 'Microsoft YaHei', sans-serif; line-height: 1.6; margin: 0 auto; padding: 20px; max-width: 800px; }
        h1.article-title { color: #2c3e50; border-bottom: 2px solid #ff6600; padding-bottom: 10px; margin-top: 20px; }
        .article-meta { color: #7f8c8d; font-size: 14px; margin: 20px 0; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .article-content { line-height: 1.8; font-size: 16px; }
        .article-content p { margin-bottom: 15px; }
    </style>
</head>
<body>
    <h1 class="article-title">${article.title}</h1>
    <div class="article-meta">
        发布日期: ${article.date.substring(0,4)}-${article.date.substring(4,6)}-${article.date.substring(6,8)} | 
        分类: ${CONFIG.typeMap[article.type]} | 
        来源: 教学教研部
    </div>
    <div class="article-content">
        <p>这是关于"${article.title}"的详细内容。</p>
        <p>本文是示例文章，实际使用时请替换为真实内容。</p>
        <p>文章正文内容在这里展示，可以包含文字、图片、表格等多种形式。</p>
        <p>更多教学教研信息，请关注学校官方网站。</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ 创建: ${filename}`);
  });
  
  console.log('🎉 教学教研示例文件创建完成，共10篇示例文章');
  console.log('📁 文件位置: ' + path.resolve(CONFIG.articleDir));
  console.log('\n📋 文件列表:');
  sampleArticles.forEach(article => {
    console.log(`   paper_${article.type}_${article.date}.html`);
  });
}

// 运行脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--create-samples')) {
    createSampleArticles();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法:
  node generate-list.js [选项]
  
选项:
  --create-samples   创建示例文章文件
  --help, -h         显示此帮助信息
  
文件命名要求:
  paper_类型_YYYYMMDD.html
   支持的类型: xlfd(心理辅导), xwjz(行为矫正), whsy(文化素养), jqtg(坚强体格), xyfc(学员风采)
  
输出文件:
  paper/list.json
  
示例:
  node generate-list.js
  node generate-list.js --create-samples
    `);
  } else {
    generateIndex();
  }
}