export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Deployment Test</h1>
        <p className="mt-4">If you can see this, your deployment is working!</p>
        <p className="mt-2 text-sm text-gray-600">Environment: {process.env.NODE_ENV}</p>
        <p className="text-sm text-gray-600">
          Mapbox Token: {process.env.NEXT_PUBLIC_MAPBOX_PK ? "Present" : "Missing"}
        </p>
      </div>
    </div>
  )
}
