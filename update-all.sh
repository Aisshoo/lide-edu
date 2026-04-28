#!/bin/bash

# 学校网站内容索引生成工具

clear
echo "========================================"
echo "  学校网站内容索引生成工具 v2.0"
echo "========================================"
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js"
    echo
    echo "请安装Node.js后再运行此脚本"
    echo "下载地址: https://nodejs.org/zh-cn/"
    echo
    exit 1
fi

echo "✅ 检测到Node.js版本:"
node --version
echo

# 主菜单函数
show_menu() {
    clear
    echo "========================================"
    echo "  学校网站内容索引生成工具 v2.0"
    echo "========================================"
    echo
    
    echo "📁 当前目录结构:"
    ls -la | grep -v "update-all" | more
    echo
    
    echo "📊 文件统计:"
    if [ -d "paper" ]; then
        count=$(ls paper/*.html 2>/dev/null | wc -l)
        echo "   paper目录: $count 个HTML文件"
    else
        echo "   paper目录: 不存在"
    fi
    
    if [ -d "news" ]; then
        count=$(ls news/*.html 2>/dev/null | wc -l)
        echo "   news目录: $count 个HTML文件"
    else
        echo "   news目录: 不存在"
    fi
    echo
    
    echo "========================================"
    echo "  请选择要生成索引的内容:"
    echo "========================================"
    echo "  1. 教学教研文章 (paper目录)"
    echo "  2. 学校资讯新闻 (news目录)"
    echo "  3. 全部生成"
    echo "  4. 创建示例文件"
    echo "  5. 打开对应目录"
    echo "  0. 退出"
    echo "========================================"
    echo
}

# 检查并创建目录
check_dirs() {
    echo "📁 检查目录结构..."
    echo
    
    if [ ! -d "paper" ]; then
        echo "📁 创建paper目录..."
        mkdir -p paper
        echo "✅ paper目录创建完成"
    else
        echo "✅ paper目录已存在"
    fi
    
    if [ ! -d "news" ]; then
        echo "📁 创建news目录..."
        mkdir -p news
        echo "✅ news目录创建完成"
    else
        echo "✅ news目录已存在"
    fi
    
    echo
}

# 检查生成脚本
check_scripts() {
    if [ ! -f "generate-list.js" ]; then
        echo "❌ 错误: 未找到generate-list.js脚本"
        return 1
    fi
    
    if [ ! -f "generate-news-list.js" ]; then
        echo "❌ 错误: 未找到generate-news-list.js脚本"
        return 1
    fi
    
    return 0
}

# 主程序
check_dirs

if ! check_scripts; then
    echo
    read -p "按任意键继续..."
    show_menu
fi

while true; do
    show_menu
    
    read -p "请输入选择 (0-5): " choice
    
    case $choice in
        1)
            echo
            echo "========================================"
            echo "  正在生成教学教研文章索引..."
            echo "========================================"
            echo
            node generate-list.js
            echo
            echo "✅ 教学教研文章索引生成完成!"
            echo "   输出文件: paper/list.json"
            echo
            read -p "按任意键继续..."
            ;;
        2)
            echo
            echo "========================================"
            echo "  正在生成学校资讯新闻索引..."
            echo "========================================"
            echo
            node generate-news-list.js
            echo
            echo "✅ 学校资讯新闻索引生成完成!"
            echo "   输出文件: news/list.json"
            echo
            read -p "按任意键继续..."
            ;;
        3)
            echo
            echo "========================================"
            echo "  正在生成全部内容索引..."
            echo "========================================"
            echo
            echo "📄 生成教学教研文章索引..."
            node generate-list.js
            echo
            echo "📄 生成学校资讯新闻索引..."
            node generate-news-list.js
            echo
            echo "✅ 全部索引生成完成!"
            echo "   教学教研: paper/list.json"
            echo "   学校资讯: news/list.json"
            echo
            read -p "按任意键继续..."
            ;;
        4)
            clear
            echo "========================================"
            echo "  创建示例文件"
            echo "========================================"
            echo
            echo "请选择要创建的示例文件类型:"
            echo "  1. 教学教研示例文件 (paper目录)"
            echo "  2. 学校资讯示例文件 (news目录)"
            echo "  3. 全部示例文件"
            echo "  0. 返回主菜单"
            echo
            
            read -p "请输入选择: " sample_choice
            
            case $sample_choice in
                1)
                    echo
                    echo "📝 正在创建教学教研示例文件..."
                    node generate-list.js --create-samples
                    echo
                    read -p "按任意键继续..."
                    ;;
                2)
                    echo
                    echo "📝 正在创建学校资讯示例文件..."
                    node generate-news-list.js --create-samples
                    echo
                    read -p "按任意键继续..."
                    ;;
                3)
                    echo
                    echo "📝 正在创建全部示例文件..."
                    echo
                    echo "📁 创建教学教研示例文件..."
                    node generate-list.js --create-samples
                    echo
                    echo "📁 创建学校资讯示例文件..."
                    node generate-news-list.js --create-samples
                    echo
                    read -p "按任意键继续..."
                    ;;
                0)
                    continue
                    ;;
                *)
                    echo "❌ 无效的选择"
                    sleep 2
                    ;;
            esac
            ;;
        5)
            clear
            echo "========================================"
            echo "  打开目录"
            echo "========================================"
            echo
            echo "请选择要打开的目录:"
            echo "  1. paper目录 (教学教研)"
            echo "  2. news目录 (学校资讯)"
            echo "  3. 根目录"
            echo "  0. 返回主菜单"
            echo
            
            read -p "请输入选择: " dir_choice
            
            case $dir_choice in
                1)
                    if [ -d "paper" ]; then
                        if [[ "$OSTYPE" == "darwin"* ]]; then
                            open paper
                        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                            xdg-open paper
                        else
                            echo "📁 paper目录: $(pwd)/paper"
                        fi
                    else
                        echo "❌ paper目录不存在"
                        read -p "按任意键继续..."
                    fi
                    ;;
                2)
                    if [ -d "news" ]; then
                        if [[ "$OSTYPE" == "darwin"* ]]; then
                            open news
                        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                            xdg-open news
                        else
                            echo "📁 news目录: $(pwd)/news"
                        fi
                    else
                        echo "❌ news目录不存在"
                        read -p "按任意键继续..."
                    fi
                    ;;
                3)
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        open .
                    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                        xdg-open .
                    else
                        echo "📁 当前目录: $(pwd)"
                    fi
                    ;;
                0)
                    continue
                    ;;
                *)
                    echo "❌ 无效的选择"
                    sleep 2
                    ;;
            esac
            ;;
        0)
            echo
            echo "👋 感谢使用学校网站内容索引生成工具!"
            echo
            exit 0
            ;;
        *)
            echo "❌ 无效的选择，请重新输入"
            sleep 2
            ;;
    esac
done