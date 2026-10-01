import Image from 'next/image';

const ASM = [
  ['0x1c0001a40', 'mov', 'rcx, [rsp+0x28]'],
  ['0x1c0001a45', 'call', 'IoGetCurrentIrpStackLocation'],
  ['0x1c0001a4a', 'mov', 'edx, [rax+0x18]'],
  ['0x1c0001a4d', 'cmp', 'edx, 0x222003'],
  ['0x1c0001a53', 'jne', 'loc_1c0001b10'],
  ['0x1c0001a59', 'mov', 'r8, [rbx+0x10]'],
  ['0x1c0001a5d', 'rep', 'movsb'],
  ['0x1c0001a5f', 'xor', 'eax, eax'],
  ['0x1c0001a61', 'ret', ''],
];

const NODES = [
  [50, 50, 9], [22, 30, 6], [78, 28, 7], [30, 74, 6], [72, 74, 8], [12, 56, 4], [88, 54, 5], [50, 16, 5], [50, 88, 4], [36, 44, 4], [64, 46, 4],
];
const EDGES = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6], [1, 7], [2, 7], [3, 8], [4, 8], [0, 9], [0, 10], [9, 1], [10, 2], [3, 9], [4, 10]];

function Security() {
  return (
    <div className="viz viz--security">
      <div className="viz__scan" />
      <div className="viz__asm mono">
        {ASM.map(([a, op, arg], i) => (
          <div key={a} className="viz__asm-row" data-hot={i === 6}>
            <span className="viz__addr">{a}</span>
            <span className="viz__op">{op}</span>
            <span>{arg}</span>
          </div>
        ))}
      </div>
      <div className="viz__badge mono">
        <span>LLM triage</span>
        <strong>96%</strong>
      </div>
    </div>
  );
}

function Graph() {
  return (
    <div className="viz viz--graph">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} style={{ '--i': i }} />
        ))}
        {NODES.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r / 2} style={{ '--i': i }} />
        ))}
      </svg>
      <span className="viz__tag mono">cos(syllabus, pyq) = 0.82</span>
    </div>
  );
}

function Cloud() {
  return (
    <div className="viz viz--cloud mono">
      <div className="viz__lb">nginx · load balancer</div>
      <div className="viz__wires" />
      <div className="viz__nodes">
        {['alpha-01', 'beta-02', 'gamma-03'].map((n, i) => (
          <div key={n} className="viz__node" style={{ '--i': i }}>
            <span className="viz__dot" />
            {n}
          </div>
        ))}
      </div>
      <div className="viz__log">
        <span>GET /die → beta-02 down</span>
        <span>restarting… beta-02 healthy</span>
      </div>
    </div>
  );
}

function Ml() {
  return (
    <div className="viz viz--ml">
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

const VARIANTS = { security: Security, graph: Graph, cloud: Cloud, ml: Ml };

export default function ProjectVisual({ project, sizes = '480px', priority = false }) {
  if (project.image) {
    return (
      <div className="visual">
        <Image src={project.image} alt={`${project.title} screenshot`} fill sizes={sizes} priority={priority} />
      </div>
    );
  }
  const V = VARIANTS[project.visual] ?? Ml;
  return (
    <div className="visual" style={{ '--accent': project.accent }} role="img" aria-label={`${project.title}: ${project.kind}`}>
      <V />
    </div>
  );
}
