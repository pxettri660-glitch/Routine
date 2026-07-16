const fs = require('fs');
let code = fs.readFileSync('src/components/More.tsx', 'utf8');
if (!code.includes('const isAdmin =')) {
  code = code.replace("const More = React.memo(function More({ onNavigate }: MoreProps) {", "const More = React.memo(function More({ onNavigate }: MoreProps) {\n  const { user } = useAuth();\n  const isAdmin = user && [import.meta.env.VITE_ADMIN_UID, 'gwvcfcQqpKgFf8oR6OruOmYm1s82'].includes(user.uid);");
  fs.writeFileSync('src/components/More.tsx', code);
}
