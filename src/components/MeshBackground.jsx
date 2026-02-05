export default function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-20 bg-[#f3f4f6]">
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-60 mix-blend-multiply filter blur-3xl animate-blob bg-purple-200 rounded-full"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] opacity-60 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 bg-blue-200 rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[120%] h-[120%] opacity-60 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 bg-pink-100 rounded-full"></div>
    </div>
  );
}