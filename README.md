# MCP Calculator

Простой MCP-сервер с двумя tools:
- **calculate** — вычисляет математические выражения (`2 + 2`, `(3 + 5) * 2`, `2 ** 10`)
- **convert-base** — конвертирует числа между системами счисления (bin/oct/dec/hex)

## Быстрый старт

### 1. Установка и сборка

```bash
npm install
npm run build
```

### 2. Подключение к Claude Code

Проект содержит `.mcp.json` — Claude Code подхватит сервер автоматически при открытии папки.

Либо добавить вручную:

```bash
claude mcp add calculator -- node /ПОЛНЫЙ/ПУТЬ/dist/index.js
```

### 3. Проверка

```bash
claude mcp list
```

Должен появиться сервер `calculator`.

### 4. Тестирование

Запусти `claude` и попроси:

```
Посчитай (2 + 3) * 4 - 1
```

```
Переведи число 255 из десятичной системы в двоичную
```

```
Сколько будет 2^32?
```

Claude увидит доступные tools и автоматически вызовет `calculate` или `convert-base`.

## Как это работает

```
Claude Code (клиент)          MCP Calculator (сервер)
     │                              │
     │── initialize ───────────────>│
     │<── server info + tools ──────│
     │                              │
     │── call calculate ───────────>│
     │   { expression: "2+2" }      │
     │<── result: "2+2 = 4" ────────│
     │                              │
```

Транспорт: **STDIO** (stdin/stdout). Claude Code запускает сервер как дочерний процесс и общается с ним по JSON-RPC 2.0 через pipes.

## Структура проекта

```
mcp-calculator/
├── src/
│   └── index.ts      ← исходник сервера
├── dist/
│   └── index.js      ← скомпилированный JS (после npm run build)
├── .mcp.json         ← автоподключение в Claude Code
├── package.json
├── tsconfig.json
└── README.md
```
