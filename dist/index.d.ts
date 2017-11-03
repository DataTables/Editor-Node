import Editor from './editor';
import Field from './field';
import Format from './formatters';
import Mjoin from './mjoin';
import Options from './options';
import promisify from './promisify';
import Upload from './upload';
import Validate from './validators';
export default class  extends Editor {
    static Field: typeof Field;
    static Format: typeof Format;
    static Mjoin: typeof Mjoin;
    static Options: typeof Options;
    static promisify: typeof promisify;
    static Upload: typeof Upload;
    static Validate: typeof Validate;
}
