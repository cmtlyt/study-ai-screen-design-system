import fs from 'node:fs/promises';
import { createAgent, tool } from 'langchain';
import z from 'zod';
import matter from 'gray-matter';
import { createModelOnly } from './utils/create-model';
import { formatOutput } from './utils/format-output';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const skillsDir = fileURLToPath(new URL('./skills.local', import.meta.url));
const entries = await fs.readdir(skillsDir, { withFileTypes: true });
const skills: Array<{ name: string; description: string; path: string }> = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
  const raw = await fs.readFile(skillPath, 'utf-8');
  const { data } = matter(raw);

  skills.push({
    name: data.name,
    description: data.description,
    path: skillPath,
  });
}

const loadSkillTool = tool(
  async ({ skillName }) => {
    console.debug(`\n查询的skill名: ${skillName}`);
    const skill = skills.find((skill) => skill.name === skillName)!;

    return fs.readFile(skill.path, 'utf-8');
  },
  {
    name: 'load_skill',
    description: '根据名称加载skill',
    schema: z.object({
      skillName: z.enum(skills.map((item) => item.name)).describe('skill名称'),
    }),
  },
);

const skillDescriptions = skills.map((item) => `- ${item.name}: ${item.description}`).join('\n');

const agent = createAgent({
  model: createModelOnly(),
  tools: [loadSkillTool],
  systemPrompt: `你是一个商城客服助手

下面是你可以使用的 Skills:

${skillDescriptions}

处理用户问题时遵守下面的规则:

1. 如果问题与一项或多项 Skill 匹配, 先调用 load_skill 分别加载需要的完整说明
2. 不要重复加载当前上下文中已经存在的 Skill
3. 加载完成后, 按照 Skill 中的流程处理问题
4. 如果没有匹配的 Skill, 按照通用规则回答, 不要猜测平台政策或业务状态
5. load_skill 只负责加载说明, 不代表业务操作已经执行`,
});

// const question = '我买的手机昨天刚到, 还没有激活, 现在不想要了, 可以退货吗';
// const question = '我的手机插上充电器没有反应, 应该怎么排查';
const question = '我的手机插上充电器没有反应, 应该怎么排查? 如果我现在不想要了, 可以退货吗';

const result = await agent.invoke({
  messages: [{ role: 'user', content: question }],
});

console.debug('result', formatOutput(result));
