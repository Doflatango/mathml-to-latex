import { Wrapper } from './wrapper';

// Helps counting string lenght in unicode character
const unicodeMatchRegexp = /./gu
const singleTexSymbolRegexp = /^\\[a-zA-Z0-9]+$/
const simpleNumberRegexp = /^\-?[0-9]+(\.[0-9]+)?$/

export class ParenthesisWrapper {
  protected _open = '\\left(';
  protected _close = '\\right)';
  protected _translatedOpen = '\\left(\\right.';
  protected _translatedClose = '\\left.\\right)';

  wrap(str: string): string {
    return new Wrapper(this._open, this._close).wrap(str);
  }

  // The following situations are considered to be a unit:
  //  A single Unicode character, eg. x
  //  A number, eg. 0.618
  //  A single LaTex command, eg. \int \sum which usually used with msub/msup/msubsup
  //  An expression that wrapped by parenthesis, eg. \left( x + y \right), \left(\right. x + y \left.\right),
  wrapIfMoreThanOneUnit(str: string): string {
    if (str.length <= 1) return str;

    const m = str.match(unicodeMatchRegexp);
    if (m && m.length <= 1) return str;

    if (str[0] == '\\') {
      if (singleTexSymbolRegexp.test(str)) return str;
      if (this.alreadyWrapped(str)) return str;
    } else if (simpleNumberRegexp.test(str)) {
      return str;
    }

    return this.wrap(str);
  }

  // Checks LaTex str is already wrapped by parenthesis or not.
  private alreadyWrapped(str: string): boolean {
    const shortOpenLength = this._open.length;
    const shortCloseLength = this._close.length;
    const longWrapperLength = this._translatedOpen.length;

    if (str.length < shortOpenLength || !str.startsWith(this._open)) return false;
    const startsWithLongWrapper = str.startsWith(this._translatedOpen);

    let longOpenCounting = 0;
    let shortOpenCounting = 0;
    let i = 0;
    while (true) {
      if (i >= str.length) break;

      if (str[i] == '\\') {
        if (startsWithLongWrapper) {
          let end = i + longWrapperLength;
          if (str.length >= end) {
            let subtring = str.substring(i, end);

            if (subtring == this._translatedOpen) {
              longOpenCounting++;
              i += longWrapperLength;
              continue;
            }

            if (subtring == this._translatedClose) {
              longOpenCounting--;
              i += longWrapperLength;
              if (longOpenCounting == 0 && end == str.length) {
                return true;
              }
              continue;
            }
          }
        } else {
          let end = i + shortOpenLength;
          if (str.length >= end && str.substring(i, end) == this._open) {
            shortOpenCounting++;
            i += shortOpenLength;
            continue;
          }

          end = i + shortCloseLength;
          if (str.length >= end && str.substring(i, end) == this._close) {
            shortOpenCounting--;
            i += shortCloseLength;
            if (shortOpenCounting == 0 && end == str.length) {
              return true;
            }
            continue;
          }
        }
      }

      i++;
    }

    return false;
  }
}
