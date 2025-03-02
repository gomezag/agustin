import { BlockMath } from "react-katex";
import './BlogBubble.css';
import "katex/dist/katex.min.css";

interface FormulaProps {
    latex: string;
  }
const Formula: React.FC<FormulaProps> = ({ latex }) => {
    const latexString = String.raw`
    \begin{align*}
    \vec{F_G} &= G \cdot \frac{m_1 m_2}{r_{i,j}^2} \\ \\
    \vec{F_E} &= - k \cdot \frac{q_1 q_2}{r_{i,j}^2} \\ \\
    \vec{F_N} &= c \cdot \frac{e^{-r_{i,j}/R} (r_{i,j} + R)}{R r^2} \\ \\
    \vec{F} &= \vec{F_G} +  \vec{F_E} + \vec{F_N}
    \end{align*}
  `;

  return (
    <div className="formula-wrapper">
      <div className="formula-container">
        <BlockMath math={latex} />
      </div>
    </div>
  );
};

export default Formula;
