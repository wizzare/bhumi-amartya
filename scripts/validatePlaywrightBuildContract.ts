import fs from "node:fs";

const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8")) as { exclude?: string[] };
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as { scripts?: Record<string, string>; devDependencies?: Record<string, string> };
const config = fs.readFileSync("playwright.r3.config.ts", "utf8");
if (!tsconfig.exclude?.includes("playwright*.config.ts") || !tsconfig.exclude?.includes("tests") || !tsconfig.exclude?.includes("test-wellness-verification.spec.ts")) throw new Error("Playwright build scope is not excluded");
if (!config.includes('@playwright/test') || !config.includes('testDir: "tests/wellness"')) throw new Error("active R3 config contract changed");
if (Object.values(packageJson.scripts || {}).some((script) => script.includes("playwright.r3"))) throw new Error("unexpected production script ownership");
if (config.includes("any") || config.includes("@ts-ignore") || config.includes("@ts-expect-error")) throw new Error("unsafe Playwright config escape");
if (fs.existsSync("node_modules/@playwright/test")) throw new Error("audit expected no installed @playwright/test");
console.log("PLAYWRIGHT_BUILD_CONTRACT_PASS");
export {};
