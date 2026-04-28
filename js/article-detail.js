console.log('✅ 上下篇脚本启动');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM加载完成');
    
    // 检查是否在news目录下
    const currentPath = window.location.pathname;
    console.log('📁 当前路径:', currentPath);
    
    // 获取当前页面文件名（不包含路径）
    const currentPage = currentPath.split('/').pop();
    console.log('📄 当前页面:', currentPage);
    
    if (!currentPage.endsWith('.html')) {
        console.warn('❌ 当前页面不是HTML文件，跳过导航初始化');
        return;
    }
    
    // 设置导航
    setupArticleNavigation();
});

function setupArticleNavigation() {
    console.log('🚀 开始设置文章导航');
    
    const prevBtn = document.getElementById('prevArticle');
    const nextBtn = document.getElementById('nextArticle');
    const currentInfo = document.querySelector('.article-navigation .current-info');
    
    if (!prevBtn || !nextBtn || !currentInfo) {
        console.error('❌ 导航元素未找到');
        return;
    }
    
    // 获取新闻列表
    fetch('../news/list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP错误！状态码: ${response.status}`);
            }
            return response.json();
        })
        .then(newsList => {
            console.log('✅ 获取到新闻列表，总数:', newsList.length);
            
            if (!Array.isArray(newsList) || newsList.length === 0) {
                throw new Error('新闻列表为空或格式错误');
            }
            
            // 验证list.json格式
            newsList.forEach((item, index) => {
                console.log(`📝 列表项 ${index + 1}:`, {
                    title: item.title,
                    date: item.date,
                    filename: item.filename
                });
            });
            
            // 获取当前页面在列表中的索引
            const currentPage = window.location.pathname.split('/').pop();
            const currentIndex = findCurrentPageIndex(newsList, currentPage);
            
            console.log('🔍 当前文章索引:', currentIndex);
            
            if (currentIndex === -1) {
                console.error('❌ 未找到当前文章在列表中的位置');
                showNavigationError();
                return;
            }
            
            // 设置导航按钮
            setupNavigationButtons(currentIndex, newsList, prevBtn, nextBtn, currentInfo);
        })
        .catch(error => {
            console.error('❌ 加载新闻列表失败:', error);
            showNavigationError(error.message);
        });
}

function findCurrentPageIndex(newsList, currentPage) {
    // 清理页面名称，只保留核心部分
    const cleanPageName = currentPage
        .split('?')[0]  // 移除查询参数
        .split('#')[0]  // 移除hash
        .trim();
    
    console.log('🔍 清理后的页面名:', cleanPageName);
    
    // 1. 精确匹配
    let index = newsList.findIndex(item => 
        item.filename && item.filename.trim() === cleanPageName
    );
    
    if (index !== -1) {
        console.log('✅ 精确匹配成功，索引:', index);
        return index;
    }
    
    // 2. 忽略大小写匹配
    index = newsList.findIndex(item => 
        item.filename && item.filename.trim().toLowerCase() === cleanPageName.toLowerCase()
    );
    
    if (index !== -1) {
        console.log('✅ 忽略大小写匹配成功，索引:', index);
        return index;
    }
    
    // 3. 日期匹配（从文件名中提取日期）
    const dateMatch = cleanPageName.match(/(\d{8})/);
    if (dateMatch) {
        const dateStr = dateMatch[1];
        console.log('🔍 尝试日期匹配，日期:', dateStr);
        
        index = newsList.findIndex(item => {
            if (!item.filename) return false;
            
            // 检查文件名是否包含该日期
            const filenameContainsDate = item.filename.includes(dateStr);
            
            // 检查日期字段是否匹配
            let dateFieldMatch = false;
            if (item.date) {
                const cleanDate = item.date.replace(/[-/]/g, '');
                dateFieldMatch = cleanDate.includes(dateStr) || dateStr.includes(cleanDate);
            }
            
            return filenameContainsDate || dateFieldMatch;
        });
        
        if (index !== -1) {
            console.log('✅ 日期匹配成功，索引:', index);
            return index;
        }
    }
    
    // 4. 模糊匹配（包含关系）
    index = newsList.findIndex(item => {
        if (!item.filename) return false;
        const cleanFilename = item.filename.trim().toLowerCase();
        const cleanCurrent = cleanPageName.toLowerCase();
        return cleanFilename.includes(cleanCurrent) || cleanCurrent.includes(cleanFilename);
    });
    
    if (index !== -1) {
        console.log('✅ 模糊匹配成功，索引:', index);
        return index;
    }
    
    console.warn('⚠️ 所有匹配方式都失败了');
    return -1;
}

function setupNavigationButtons(currentIndex, newsList, prevBtn, nextBtn, currentInfo) {
    const totalItems = newsList.length;
    
    // 更新当前信息
    currentInfo.textContent = `第 ${currentIndex + 1} 篇/共 ${totalItems} 篇`;
    
    // 禁用/启用按钮
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalItems - 1;
    
    // 设置上一篇按钮
    if (currentIndex > 0) {
        const prevArticle = newsList[currentIndex - 1];
        prevBtn.innerHTML = `<i class="fa fa-arrow-left"></i> 上一篇：${truncateText(prevArticle.title, 10)}`;
        
        prevBtn.onclick = function() {
            if (prevArticle.filename) {
                const prevUrl = `../news/${prevArticle.filename}`;
                console.log('➡️ 跳转到上一篇:', prevUrl);
                window.location.href = prevUrl;
            }
        };
    } else {
        prevBtn.innerHTML = `<i class="fa fa-arrow-left"></i> 没有上一篇了`;
    }
    
    // 设置下一篇按钮
    if (currentIndex < totalItems - 1) {
        const nextArticle = newsList[currentIndex + 1];
        nextBtn.innerHTML = `下一篇：${truncateText(nextArticle.title, 10)} <i class="fa fa-arrow-right"></i>`;
        
        nextBtn.onclick = function() {
            if (nextArticle.filename) {
                const nextUrl = `../news/${nextArticle.filename}`;
                console.log('➡️ 跳转到下一篇:', nextUrl);
                window.location.href = nextUrl;
            }
        };
    } else {
        nextBtn.innerHTML = `没有下一篇了 <i class="fa fa-arrow-right"></i>`;
    }
    
    console.log('✅ 导航按钮设置完成');
}

function truncateText(text, maxLength) {
    if (!text) return '无标题';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showNavigationError(message = '导航初始化失败') {
    const prevBtn = document.getElementById('prevArticle');
    const nextBtn = document.getElementById('nextArticle');
    const currentInfo = document.querySelector('.article-navigation .current-info');
    
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    
    if (currentInfo) {
        currentInfo.innerHTML = `
            <span style="color: #ff4d4f; font-size: 14px;">
                <i class="fa fa-warning"></i> ${message}
            </span>
        `;
    }
    
    console.error('❌ 导航错误已显示');
}

// 暴露函数供调试使用
window.reloadNavigation = setupArticleNavigation;
window.findCurrentPageIndex = findCurrentPageIndex;

console.log('✅ article-detail.js 加载完成');