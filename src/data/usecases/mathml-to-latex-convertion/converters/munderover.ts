import { ToLaTeXConverter } from '../../../../domain/usecases/to-latex-converter';
import { MathMLElement } from '../../../protocols/mathml-element';
import { mathMLElementToLaTeXConverter } from '../../../helpers';
import { InvalidNumberOfChildrenError } from '../../../errors';

export class MUnderover implements ToLaTeXConverter {
  private readonly _mathmlElement: MathMLElement;

  constructor(mathElement: MathMLElement) {
    this._mathmlElement = mathElement;
  }

  static arrowsWithText: Record<string, string> = {
    '=': '\\xlongequal',
    '\\rightarrow': '\\xrightarrow',
    '\\leftarrow': '\\xleftarrow',
    '\\leftrightarrow': '\\xleftrightarrow',
    '\\rightleftarrows': '\\xtofrom',
    '\\Longleftrightarrow': '\\xLongleftrightarrow',
    '\\Longrightarrow': '\\xLongrightarrow',
    '\\Longleftarrow': '\\xLongleftarrow',
    '\\Leftrightarrow': '\\xLeftrightarrow',
    '\\rightarrowtail': '\\xmapsto',
    '\\twoheadrightarrow': '\\xtwoheadrightarrow',
    '\\twoheadleftarrow': '\\xtwoheadleftarrow',
  };

  convert(): string {
    const { name, children } = this._mathmlElement;
    const childrenLength = children.length;

    if (childrenLength !== 3) throw new InvalidNumberOfChildrenError(name, 3, childrenLength);

    const base = mathMLElementToLaTeXConverter(children[0]).convert();
    const underContent = mathMLElementToLaTeXConverter(children[1]).convert();
    const overContent = mathMLElementToLaTeXConverter(children[2]).convert();

    if (MUnderover.arrowsWithText[base]) {
      return `${MUnderover.arrowsWithText[base]}[${underContent}]{${overContent}}`;
    }

    return `${base}_{${underContent}}^{${overContent}}`;
  }
}
