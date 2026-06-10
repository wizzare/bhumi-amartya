const fs = require('fs');
let content = fs.readFileSync('app/reports/weekly/page.tsx', 'utf8');

// The backslashes were escaping the template literals. We'll replace it safely.
// We use a regex to match the exact string including the backslashes
content = content.replace(/return \\`\\\$\\{startDate\\} - \\$\\{endDate\\}\\`;/g, 'return `${startDate} - ${endDate}`;');

fs.writeFileSync('app/reports/weekly/page.tsx', content);
