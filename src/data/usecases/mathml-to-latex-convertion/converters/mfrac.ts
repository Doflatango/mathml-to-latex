import { ToLaTeXConverter } from '../../../../domain/usecases/to-latex-converter';
import { MathMLElement } from '../../../protocols/mathml-element';
import { InvalidNumberOfChildrenError } from '../../../errors';
import { ParenthesisWrapper, mathMLElementToLaTeXConverter } from '../../../helpers';

export class MFrac implements ToLaTeXConverter {
  private readonly _mathmlElement: MathMLElement;

  constructor(mathElement: MathMLElement) {
    this._mathmlElement = mathElement;
  }

  convert(): string {
    const { children, name } = this._mathmlElement;
    const childrenLength = children.length;

    if (childrenLength !== 2) throw new InvalidNumberOfChildrenError(name, 2, childrenLength);

    const num = mathMLElementToLaTeXConverter(children[0]).convert();
    const den = mathMLElementToLaTeXConverter(children[1]).convert();

    if (this._isBevelled()) {
      return `${this._wrapIfMoreThanOneUnit(num)}/${this._wrapIfMoreThanOneUnit(den)}`;
    } else if (this._isLineless()) {
      return `\\binom{${num}}{${den}}`;
    }

    return `\\frac{${num}}{${den}}`;
  }

  private _wrapIfMoreThanOneUnit(str: string): string {
    return new ParenthesisWrapper().wrapIfMoreThanOneUnit(str);
  }

  private _isBevelled(): boolean {
    return !!this._mathmlElement.attributes.bevelled;
  }

  private _isLineless(): boolean {
    return this._mathmlElement.attributes.linethickness === '0'
  }
}
