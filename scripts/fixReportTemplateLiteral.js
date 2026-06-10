const fs = require('fs');
let content = fs.readFileSync('app/reports/weekly/page.tsx', 'utf8');

// The backslashes were escaping the template literals. We'll replace it safely.
content = content.replace(/\\`\\$\\{startDate\\} - \\$\\{endDate\\}\\`/g, '\`${startDate} - ${endDate}\`');

fs.writeFileSync('app/reports/weekly/page.tsx', content);
