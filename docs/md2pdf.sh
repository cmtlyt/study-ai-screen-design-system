#!/usr/bin/env bash
# resume.md → resume.pdf 转换脚本
# 依赖：node（md 转 html）、chromium headless（html 转 pdf）、Noto Sans CJK（沙箱已装）
# 用法：bash docs/md2pdf.sh
set -euo pipefail
cd "$(dirname "$0")"

# ---- 第一步：markdown → html（不引外部依赖，内置转换器处理简历用到的全部语法）----
node --input-type=module -e '
import { readFileSync, writeFileSync } from "fs";

const md = readFileSync("resume.md", "utf8");
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
// 行内格式：加粗/代码；占位符 {xxx} 高亮为红色便于检查遗漏
const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\{([^{}]+)\}/g, `<span class="ph">{$1}</span>`);

const lines = md.split("\n");
let out = [], inList = false;
const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };

for (const line of lines) {
  const t = line.trim();
  if (!t) { closeList(); continue; }
  if (t === "---") { closeList(); out.push("<hr>"); continue; }
  let m;
  if ((m = t.match(/^(#{1,3})\s+(.*)/))) {
    closeList();
    const lv = m[1].length;
    const text = inline(m[2].replace(/[«»]/g, ""));
    if (lv === 1) out.push(`<h1>${text}</h1>`);
    else if (lv === 2) out.push(`<h2>${text}</h2>`);
    else out.push(`<h3>${text}</h3>`);
  } else if ((m = t.match(/^[-*]\s+(.*)/))) {
    if (!inList) { out.push("<ul>"); inList = true; }
    out.push(`<li>${inline(m[1])}</li>`);
  } else {
    closeList();
    // 技能行（**xxx**：开头）与项目元信息行（**背景**：开头）分别套样式类
    if (/^\*\*[^*]+\*\*：/.test(t)) out.push(`<p class="skill-line">${inline(t)}</p>`);
    else if (/^\*\*(背景|角色|技术栈|结果)/.test(t)) out.push(`<p class="proj-meta">${inline(t)}</p>`);
    else out.push(`<p>${inline(t)}</p>`);
  }
}
closeList();

// 读取样式模板（resume.html 的 <style> 段），注入正文
const tpl = readFileSync("resume.html", "utf8");
const css = tpl.match(/<style>([\s\S]*?)<\/style>/)[1];
// 占位符红色高亮样式：填完占位符后此规则自然无命中
const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>${css}
.ph { color: #c0392b; background: #fdecea; padding: 0 2px; border-radius: 2px; }
</style></head><body>${out.join("\n")}</body></html>`;
writeFileSync("resume.print.html", html);
console.log("HTML 生成完成: resume.print.html");
'

# ---- 第二步：chromium headless → PDF ----
chromium --headless --disable-gpu --no-sandbox \
  --print-to-pdf=resume.pdf --no-pdf-header-footer \
  resume.print.html 2>/dev/null

echo "PDF 生成完成: docs/resume.pdf"
