@echo off
chcp 65001 >nul
title 学校网站内容索引生成工具
color 0A

echo ========================================
echo   学校网站内容索引生成工具 v2.0
echo   双击自动执行全部更新
echo ========================================
echo.

REM 获取当前脚本所在目录
set "CURRENT_DIR=%~dp0"
echo 📁 当前工作目录: %CURRENT_DIR%
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到Node.js
    echo.
    echo 请安装Node.js后再运行此脚本
    echo 下载地址: https://nodejs.org/zh-cn/
    echo.
    pause
    exit /b 1
)

echo ✅ 检测到Node.js版本:
node --version
echo.

echo 📁 检查目录结构...
echo.

REM 检查并创建paper目录
if not exist "%CURRENT_DIR%paper\" (
    echo 📁 创建paper目录...
    mkdir "%CURRENT_DIR%paper"
    echo ✅ paper目录创建完成
) else (
    echo ✅ paper目录已存在
)

REM 检查并创建news目录
if not exist "%CURRENT_DIR%news\" (
    echo 📁 创建news目录...
    mkdir "%CURRENT_DIR%news"
    echo ✅ news目录创建完成
) else (
    echo ✅ news目录已存在
)

echo.

REM 检查生成脚本是否存在
echo 📁 检查生成脚本...
if not exist "%CURRENT_DIR%generate-list.js" (
    echo ❌ 错误: 未找到 generate-list.js
    echo   位置: %CURRENT_DIR%
    echo.
    echo 📁 当前目录文件列表:
    dir "%CURRENT_DIR%*.js" 2>nul
    echo.
    pause
    exit /b 1
) else (
    echo ✅ 找到: generate-list.js
)

if not exist "%CURRENT_DIR%generate-news-list.js" (
    echo ❌ 错误: 未找到 generate-news-list.js
    echo   位置: %CURRENT_DIR%
    echo.
    echo 📁 当前目录文件列表:
    dir "%CURRENT_DIR%*.js" 2>nul
    echo.
    pause
    exit /b 1
) else (
    echo ✅ 找到: generate-news-list.js
)

echo.

REM 检查当前目录中的HTML文件数量
echo 📊 文件统计:
if exist "%CURRENT_DIR%paper\" (
    for /f %%i in ('dir /b "%CURRENT_DIR%paper\*.html" 2^>nul ^| find /c /v ""') do (
        echo   paper目录: %%i 个HTML文件
    ) || echo   paper目录: 0 个HTML文件
) else echo   paper目录: 不存在

if exist "%CURRENT_DIR%news\" (
    for /f %%i in ('dir /b "%CURRENT_DIR%news\*.html" 2^>nul ^| find /c /v ""') do (
        echo   news目录: %%i 个HTML文件
    ) || echo   news目录: 0 个HTML文件
) else echo   news目录: 不存在
echo.

REM 切换到当前目录
cd /d "%CURRENT_DIR%"

echo ========================================
echo   开始生成全部内容索引...
echo ========================================
echo.

REM 第一部分：生成教学教研文章索引
echo 📄 1. 生成教学教研文章索引...
echo   扫描目录: %CURRENT_DIR%paper\
echo   输出文件: paper\list.json
echo.

node generate-list.js
if %errorlevel% neq 0 (
    echo ❌ 教学教研文章索引生成失败
) else (
    echo ✅ 教学教研文章索引生成完成
)

echo.

REM 第二部分：生成学校资讯新闻索引
echo 📄 2. 生成学校资讯新闻索引...
echo   扫描目录: %CURRENT_DIR%news\
echo   输出文件: news\list.json
echo.

node generate-news-list.js
if %errorlevel% neq 0 (
    echo ❌ 学校资讯新闻索引生成失败
) else (
    echo ✅ 学校资讯新闻索引生成完成
)

echo.

REM 显示生成结果
echo ========================================
echo   📅 索引生成结果
echo ========================================
echo.

if exist "%CURRENT_DIR%paper\list.json" (
    echo ✅ 教学教研文章索引: paper\list.json
    echo   文件大小: 
    for %%F in ("%CURRENT_DIR%paper\list.json") do echo      %%~zF 字节
) else (
    echo ❌ 教学教研文章索引: 生成失败
)

if exist "%CURRENT_DIR%news\list.json" (
    echo ✅ 学校资讯新闻索引: news\list.json
    echo   文件大小: 
    for %%F in ("%CURRENT_DIR%news\list.json") do echo      %%~zF 字节
) else (
    echo ❌ 学校资讯新闻索引: 生成失败
)

echo.

REM 显示生成时间
echo 📅 更新时间: %date% %time%
echo.

REM 询问是否打开目录
echo 是否打开生成的索引文件目录? (y/n)
set /p open_dir="请输入选择: "

if /i "%open_dir%"=="y" (
    echo.
    echo 📁 打开目录...
    if exist "%CURRENT_DIR%paper\list.json" (
        echo   打开paper目录...
        explorer "%CURRENT_DIR%paper"
    )
    if exist "%CURRENT_DIR%news\list.json" (
        echo   打开news目录...
        explorer "%CURRENT_DIR%news"
    )
) else (
    echo.
    echo 📁 您可以在以下位置查看索引文件:
    echo   - 教学教研: %CURRENT_DIR%paper\list.json
    echo   - 学校资讯: %CURRENT_DIR%news\list.json
)

echo.
echo ========================================
echo   ✅ 索引生成完成!
echo ========================================
echo.

pause