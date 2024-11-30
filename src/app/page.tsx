import NavigationLink from "@/components/navigation/navigation-link"
import getTables from "@/data/get-tables";

const member_id = '9abb3671-96da-49a5-81aa-d2e2069a2d88';

export default async function Home() {
  const tables = await getTables();

  return (
    <div className="container px-8 py-16 space-y-16 mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-800">
        参加団体情報管理アプリ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {tables.map((table) => (
          <NavigationLink key={table.id} member_id={member_id} table={table} />
        ))}
      </div>
    </div>
  )
}

