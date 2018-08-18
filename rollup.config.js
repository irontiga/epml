// rollup.config.js
export default [
    {
        input: 'src/EpmlCore/EpmlCore.js',
        output: [
            {
                file: 'dist/epml.js',
                format: 'cjs'
            }
        ]
    },
    {
        input: '_my_tests/workerTest.js',
        output: {
            file: '_my_tests/workerTest_build.js',
            format: 'iife',
            name: 'worker'
        }
    }
]
//
//
//
// export default [
//     {
//         input: 'src/EpmlCore/EpmlCore.js',
//         output: [
//             {
//                 file: 'dist/epml.js',
//                 format: 'cjs'
//             },
//             {
//                 file: 'dist/epml.browser.js',
//                 format: 'iife',
//                 name: 'Epml'
//             }
//         ]
//     },
//     {
//         input: 'src/plugins/contentWindows/contentWindows.js',
//         output: [
//             {
//                 file: 'dist/plugins/contentWindows/contentWindows.js',
//                 format: 'cjs'
//             },
//             {
//                 file: 'dist/plugins/contentWindows/contentWindows.browser.js',
//                 format: 'iife',
//                 name: 'EpmlContentWindowPlugin'
//             }
//         ]
//     },
//     {
//         input: 'src/plugins/workers/workers.js',
//         output: [
//             {
//                 file: 'dist/plugins/workers/workers.browser.js',
//                 format: 'iife',
//                 name: 'EpmlWorkerPlugin'
//             },
//             {
//                 file: 'dist/plugins/workers/workers.js',
//                 format: 'cjs'
//             }
//         ]
//     }
// ]
