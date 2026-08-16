const fs = require('fs');
let content = fs.readFileSync('components/navigation/AppNav.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  'import { Compass, Crown, Home, MessageSquare, MoreHorizontal, Settings, Sprout, User } from "lucide-react";',
  'import { Compass, Crown, Home, MessageSquare, MoreHorizontal, Settings, Sprout, User, Activity } from "lucide-react";'
);
content = content.replace(
  'import { translations } from "@/lib/data/translations";',
  'import { translations } from "@/lib/data/translations";\nimport { useAuth } from "@/context/AuthContext";'
);

// 2. Add profile check and update moreItems
content = content.replace(
  'const [isMoreOpen, setIsMoreOpen] = useState(false);\n  const moreItems = UTILITY_NAV_ITEMS;',
  `const [isMoreOpen, setIsMoreOpen] = useState(false);
  const auth = useAuth();
  const profile = auth?.userProfile;

  const moreItems = useMemo(() => {
    const items = [...UTILITY_NAV_ITEMS];
    if (profile?.guardianRole === "founder" || profile?.email?.trim().toLowerCase() === "wizzare@gmail.com") {
      items.push({ Icon: Activity, label: "Auth Diagnostics", href: "/admin/diagnostics", labelKey: "profile" as any });
    }
    return items;
  }, [profile]);`
);

fs.writeFileSync('components/navigation/AppNav.tsx', content);
console.log('Successfully patched components/navigation/AppNav.tsx');
