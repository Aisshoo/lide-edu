/*
 * @Author: 金保虎（Aisshoo Adolf Kinyong）
 * @Github: https://gitee.com/aisshoo
 * @Email: Aisshoo.A.K@hotmail.com
 * @Date: 2026-04-29 09:01:33
 * @LastEditors: 金保虎（Aisshoo Adolf Kinyong）
 * @LastEditTime: 2026-04-29 09:09:03
 * @FilePath: \DevProgramFile\lide-edu\js\paper.js
 * @Description: 
 * @Copyright: Copyright © 2026 金保虎（Aisshoo Adolf Kinyong）. All Rights Reserved.
 */
/**
 * author 金保虎（Aisshoo Adolf Kinyong）
 * created on 29-04-2026-09h-01m
 * github: https://gitee.com/aisshoo
 * copyright 2026
*/
/**
 * 公文详情页业务逻辑
 * 包含：资讯列表加载、悬浮客服交互、回到顶部等功能
 */
$(function() {
    // 1. 动态加载相关资讯列表（模拟数据，可替换为接口请求）
    function loadNewsList() {
        const newsList = [
            { title: "关于进一步加强青少年心理健康教育的通知", url: "#" },
            { title: "2025年素质教育基地教学工作要点", url: "#" },
            { title: "家校社协同育人机制建设实施方案", url: "#" },
            { title: "心理健康教育师资培训管理办法", url: "#" },
            { title: "全封闭军事化管理规范（试行）", url: "#" }
        ];
        const $newsList = $("#newsList");
        $newsList.empty();
        newsList.forEach(item => {
            const $li = $("<li></li>");
            const $a = $("<a></a>").attr("href", item.url).text(item.title);
            $li.append($a);
            $newsList.append($li);
        });
    }

    // 2. 回到顶部功能
    function initBackToTop() {
        const $backToTop = $("#backToTop");
        // 滚动监听
        $(window).scroll(function() {
            if ($(window).scrollTop() > 300) {
                $backToTop.parent().show();
            } else {
                $backToTop.parent().hide();
            }
        });
        // 点击回到顶部
        $backToTop.click(function() {
            $("html, body").animate({ scrollTop: 0 }, 500);
        });
    }

    // 3. 悬浮客服tooltip交互（移动端点击显示/隐藏）
    function initServiceTooltip() {
        const $qrToggle = $(".qr-toggle");
        $qrToggle.click(function() {
            const $tooltip = $(this).siblings(".service-tooltip");
            // 关闭其他tooltip
            $(".service-tooltip").not($tooltip).removeClass("active");
            // 切换当前tooltip
            $tooltip.toggleClass("active");
        });
        // 点击空白处关闭tooltip
        $(document).click(function(e) {
            if (!$(e.target).closest(".service-item").length) {
                $(".service-tooltip").removeClass("active");
            }
        });
    }

    // 4. 初始化所有功能
    function initPage() {
        loadNewsList();
        initBackToTop();
        initServiceTooltip();
        // 初始化WOW动画（如需）
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
        // 初始化滚动条美化
        $("body").niceScroll({
            cursorcolor: "#1890ff",
            cursorwidth: "8px",
            cursorborder: "none"
        });
    }

    // 页面加载完成后初始化
    initPage();
});
