import React, { useCallback, useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { PyodideInterface } from 'pyodide'
import { useDropzone } from 'react-dropzone'
import { parse } from 'papaparse'
const script = require('./python/main.py')
const {
  loadPyodide
}: { loadPyodide: (arg: any) => Promise<PyodideInterface> } = require('pyodide')

const getFunc = async (code: string) => {
  const pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/'
  })
  await pyodide.loadPackage(['numpy', 'scikit-learn'])
  const main = pyodide.runPython(code)
  return main
}

const App = () => {
  const [result, setResult] = useState<number[]>([])
  const [pyarg, setPyarg] = useState<string[][]>([])
  const onDrop: (files: File[]) => void = useCallback(
    (acceptedFiles: File[]) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const result = parse(reader.result as string)
        const rows: string[][] = result.data as string[][]
        setPyarg(rows)
      })
      reader.readAsText(acceptedFiles[0], 'shift-jis')
    },
    []
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1
  })

  useEffect(() => {
    if (pyarg.length !== 3) return
    const run = async () => {
      const scriptString = await (await fetch(script)).text()
      const main = await getFunc(scriptString)
      const x = new Float32Array(pyarg[0].map((x) => Number(x)))
      const y = new Float32Array(pyarg[1].map((x) => Number(x)))
      const ret = (await main(x, y))?.toJs()
      setResult(ret)
    }
    run()
  }, [pyarg])

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        {result.length > 1 ? (
          <>
            <p>R^2: {result[0]}</p>
            <p>Importance: {result[1]}</p>
          </>
        ) : null}
      </header>
      <div
        {...getRootProps()}
        style={{
          display: 'table',
          minHeight: '30vh',
          width: '100%'
        }}>
        <input {...getInputProps()} />
        <p
          style={{
            display: 'table-cell',
            verticalAlign: 'middle',
            textAlign: 'center'
          }}>
          Drop zone
        </p>
      </div>
    </div>
  )
}

export default App
