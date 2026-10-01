import Image from 'next/image';

export default function ProjectVisual({ project, sizes = '480px', priority = false }) {
  if (project.image) {
    return (
      <div className="visual">
        <Image src={project.image} alt={`${project.title} screenshot`} fill sizes={sizes} priority={priority} />
      </div>
    );
  }
  return (
    <div className="visual visual--gen" style={{ '--accent': project.accent }} role="img" aria-label={`${project.title} visual`}>
      <div className="visual__grid" />
      <div className="visual__orb" />
      <div className="visual__code mono">
        <span>&gt;&gt;&gt; model.predict(x)</span>
        <span className="visual__out">array([0.12, 0.81, 0.07])</span>
        <span>&gt;&gt;&gt; _</span>
      </div>
      <span className="visual__glyph serif">ƒ(x)</span>
    </div>
  );
}
