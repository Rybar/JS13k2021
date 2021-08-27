//const inputs = [
//  {
//      data: 'console.log("Hello, world!");',
//      type: 'js',
//      action: 'eval',
//  },
//];

//const options = {
//  maxMemoryMB: 150,
//};

//const packer = new Packer(inputs, options);

// this typically takes about a minute or two, can be omitted if you want.
//await packer.optimize();

//const { firstLine, secondLine } = packer.makeDecoder();
//console.log(firstLine + '\n' + secondLine);

import { Packer } from 'roadroller'


export const roadrolled = () => ({
    name: 'rollup-plugin-roadroller',

    transform: (source, id) => {
      let transformedCode = source;
        const inputs = [
          {
              data: transformedCode,
              type: 'js',
              action: 'eval',
          },
        ];

        const options = {
        maxMemoryMB: 150,
        };

      const packer = new Packer(inputs, options);
      const { firstLine, secondLine } = packer.makeDecoder();
      transformedCode = firstLine + '\n' + secondLine;

      console.log(id, ' has been successfully roadrolled');

      return {
        code: transformedCode,
        map: { mappings: ''}
      };

      

    }
  });

export default {
  roadrolled
};
