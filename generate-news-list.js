// generate-news-list.js - 自动扫描news目录并生成news/list.json
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  articleDir: './news',               // 文章目录
  outputFile: './news/list.json',     // 输出文件，修改为news目录下
  pageSize: 15,                       // 每页显示数量
  typeMap: {                          // 类型映射
    hy: '行业资讯',
    xx: '学校新闻',
    all: '全部资讯'
  },
  // 文件命名模式: news_类型_YYYYMMDD.html
  filePattern: /^news_([a-z]+)_(\d{8})\.html$/i
};

// 主函数
async function generateNewsIndex() {
  console.log('🚀 开始扫描学校资讯目录...');
  console.log(`📁 扫描目录: ${path.resolve(CONFIG.articleDir)}`);
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(CONFIG.articleDir)) {
      console.error(`❌ 错误: 目录 ${CONFIG.articleDir} 不存在`);
      console.log('📂 正在创建目录...');
      fs.mkdirSync(CONFIG.articleDir, { recursive: true });
      console.log('✅ 目录创建完成，请将HTML文件放入news/目录中');
      return;
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(CONFIG.articleDir);
    console.log(`📄 找到 ${files.length} 个文件`);
    
    if (files.length === 0) {
      console.log('ℹ️  news目录为空，请添加新闻HTML文件');
      console.log('📝 文件命名格式: news_hy_20230423.html 或 news_xx_20230423.html');
      console.log('   - hy: 行业资讯');
      console.log('   - xx: 学校新闻');
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
      if (type !== 'hy' && type !== 'xx') {
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
        url: `news/${filename}`,
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
      console.log('⚠️  警告: 没有找到符合格式的新闻文件');
      console.log('\n📋 文件命名要求:');
      console.log('   news_hy_YYYYMMDD.html  (行业资讯)');
      console.log('   news_xx_YYYYMMDD.html  (学校新闻)');
      console.log('   例如: news_hy_20230423.html');
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
      byType: {
        hy: articles.filter(a => a.type === 'hy').length,
        xx: articles.filter(a => a.type === 'xx').length
      },
      skippedFiles: skippedFiles
    };
    
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
    console.log(`   ${CONFIG.typeMap.hy}: ${stats.byType.hy}篇`);
    console.log(`   ${CONFIG.typeMap.xx}: ${stats.byType.xx}篇`);
    
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

// 创建示例新闻文件
function createSampleNews() {
  const sampleArticles = [
    { type: 'hy', date: '20230423', title: '教育部发布2023年教育工作要点' },
    { type: 'hy', date: '20230420', title: '行业趋势：数字化教育转型加速' },
    { type: 'hy', date: '20230418', title: '2023年全国教育工作会议在京召开' },
    { type: 'xx', date: '20230422', title: '我校举办春季运动会圆满成功' },
    { type: 'xx', date: '20230419', title: '校园开放日吸引数百名家长参观' },
    { type: 'xx', date: '20230415', title: '我校教师在市级教学比赛中获奖' },
    { type: 'hy', date: '20230410', title: '职业教育改革新政策解读' },
    { type: 'xx', date: '20230405', title: '学校开展心理健康教育周活动' }
  ];
  
  console.log('\n📝 创建学校资讯示例文件...');
  
  // 确保目录存在
  if (!fs.existsSync(CONFIG.articleDir)) {
    fs.mkdirSync(CONFIG.articleDir, { recursive: true });
  }
  
  sampleArticles.forEach(article => {
    const filename = `news_${article.type}_${article.date}.html`;
    const filePath = path.join(CONFIG.articleDir, filename);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - 学校资讯</title>
    <style>
        body { font-family: 'Microsoft YaHei', sans-serif; line-height: 1.6; margin: 0 auto; padding: 20px; max-width: 800px; }
        h1.article-title { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 20px; }
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
        来源: 学校官网
    </div>
    <div class="article-content">
        <p>这是关于"${article.title}"的详细内容。</p>
        <p>本文是示例文章，实际使用时请替换为真实内容。</p>
        <p>文章正文内容在这里展示，可以包含文字、图片、表格等多种形式。</p>
        <p>更多相关信息，请关注学校官方网站和公告。</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`✅ 创建: ${filename}`);
  });
  
  console.log('🎉 学校资讯示例文件创建完成，共8篇示例文章');
  console.log('📁 文件位置: ' + path.resolve(CONFIG.articleDir));
  console.log('\n📋 文件列表:');
  sampleArticles.forEach(article => {
    console.log(`   news_${article.type}_${article.date}.html`);
  });
}

// 运行脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--create-samples')) {
    createSampleNews();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法:
  node generate-news-list.js [选项]
  
选项:
  --create-samples   创建示例新闻文件
  --help, -h         显示此帮助信息
  
文件命名要求:
  news_hy_YYYYMMDD.html  (行业资讯)
  news_xx_YYYYMMDD.html  (学校新闻)
  
输出文件:
  news/list.json
  
示例:
  node generate-news-list.js
  node generate-news-list.js --create-samples
    `);
  } else {
    generateNewsIndex();
  }
}