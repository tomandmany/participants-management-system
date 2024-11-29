import NavigationLink from "@/components/navigation/navigation-link"

const id = '9abb3671-96da-49a5-81aa-d2e2069a2d88';

export default function Home() {
  return (
    <div className="container px-8 py-16 space-y-16 mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-800">
        参加団体情報管理アプリ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <NavigationLink id={id} href='participants' title='参加団体' />
        <NavigationLink id={id} href='booth' title='模擬店' />
        <NavigationLink id={id} href='stage' title='屋外ステージ' />
        <NavigationLink id={id} href='room' title='教室' />
      </div>
    </div>
  )
}

