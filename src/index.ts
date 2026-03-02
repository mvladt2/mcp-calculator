import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod";

// Создаём MCP-сервер
const server = new McpServer({
  name: "calculator",
  version: "1.0.0",
});

// === Tool 1: Вычислить выражение ===
server.registerTool(
  "calculate",
  {
    title: "Calculate",
    description:
      "Evaluate a math expression. Supports +, -, *, /, **, %, parentheses. Examples: '2 + 2', '(3 + 5) * 2', '2 ** 10'",
    inputSchema: z.object({
      expression: z
        .string()
        .describe("Math expression to evaluate, e.g. '(2 + 3) * 4'"),
    }),
  },
  async ({ expression }) => {
    try {
      // Проверяем что выражение содержит только допустимые символы
      if (!/^[\d\s+\-*/().%^e]+$/i.test(expression)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: expression contains invalid characters. Only numbers and operators (+, -, *, /, **, %, parentheses) are allowed.`,
            },
          ],
          isError: true,
        };
      }

      // Заменяем ^ на ** для возведения в степень
      const sanitized = expression.replace(/\^/g, "**");
      const result = Function(`"use strict"; return (${sanitized})`)();

      if (typeof result !== "number" || !isFinite(result)) {
        return {
          content: [{ type: "text", text: `Error: result is ${result}` }],
          isError: true,
        };
      }

      return {
        content: [
          { type: "text", text: `${expression} = ${result}` },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `Error evaluating "${expression}": ${e instanceof Error ? e.message : String(e)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// === Tool 2: Конвертация систем счисления ===
server.registerTool(
  "convert-base",
  {
    title: "Base Converter",
    description:
      "Convert a number between bases (binary, octal, decimal, hex). E.g. convert 255 from base 10 to base 16.",
    inputSchema: z.object({
      value: z.string().describe("The number to convert, e.g. '255' or 'FF'"),
      fromBase: z
        .number()
        .min(2)
        .max(36)
        .describe("Source base (2-36)"),
      toBase: z
        .number()
        .min(2)
        .max(36)
        .describe("Target base (2-36)"),
    }),
  },
  async ({ value, fromBase, toBase }) => {
    try {
      const decimal = parseInt(value, fromBase);
      if (isNaN(decimal)) {
        return {
          content: [
            { type: "text", text: `Error: "${value}" is not valid in base ${fromBase}` },
          ],
          isError: true,
        };
      }
      const converted = decimal.toString(toBase).toUpperCase();
      return {
        content: [
          {
            type: "text",
            text: `${value} (base ${fromBase}) = ${converted} (base ${toBase})`,
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${e instanceof Error ? e.message : String(e)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Запуск сервера через STDIO
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Calculator server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
