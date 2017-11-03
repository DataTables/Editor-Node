import Editor from './editor';
import Field from './field';
import Format from './formatters';
import Mjoin from './mjoin';
import Options from './options';
import promisify from './promisify';
import Upload from './upload';
import Validate from './validators';

export default class extends Editor {
    public static Field = Field;
    public static Format = Format;
    public static Mjoin = Mjoin;
    public static Options = Options;
    public static promisify = promisify;
    public static Upload = Upload;
    public static Validate = Validate;
}
