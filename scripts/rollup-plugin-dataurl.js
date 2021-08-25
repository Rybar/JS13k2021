/**
 * Scan every source file for a DATAURL placeholder
 * and replace the PNG file indicated by its content
 * as a base64 encoded dataurl
 *
 * e.g. const charset = 'DATAURL:src/img/charset.png';
 * becomes
 * const charset = 'data:image/png;base64,123456badc0ffee...';
 */
import { readFileSync } from 'fs';

export const dataurl = () => ({
    name: 'rollup-plugin-dataurl',

    transform: (source, id) => {
      let transformedCode = source;

      // find all DATAURL placeholders, capture the filepaths
      const matches = [...source.matchAll(/ (.*) = 'DATAURL:(.*)'/g)];

      matches.forEach(([, variable, imageFilePath]) => {
        console.log('found ', variable, imageFilePath);
        // read the image binary content
        const data = readFileSync(`./${imageFilePath}`);
        // replace the placeholder by a base64 encoded dataurl of the image
        transformedCode = transformedCode.replace(
          ` ${variable} = 'DATAURL:${imageFilePath}'`,
          ` ${variable} = 'data:image/webp;base64,${data.toString('base64')}'`
        );
      });

      console.log('dataurl plugin done with', id);
      return {
        code: transformedCode,
        map: { mappings: ''}
      };
    }
  });

export default {
  dataurl
};
