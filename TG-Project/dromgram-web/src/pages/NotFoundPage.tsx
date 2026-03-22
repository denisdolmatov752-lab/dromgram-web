import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <p className="text-xl mb-6 text-[#8D8D8D]">Страница не найдена</p>
      <Link to="/" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark">На главную</Link>
    </div>
  );
}
