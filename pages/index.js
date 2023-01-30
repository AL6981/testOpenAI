import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  // const coiQuestions = "What kind of document is this? Who is the producer? Who is the insured? List the insurer(s) affording coverage with their NAIC number. Display any insurance coverage types and limits in a table format."

  // const penQuestions = "What kind of document is this? Be specific. Who is the auditor? What is the audit period? Is the audit period within the past year? What is the scope? List any findings from the report. If there are findings, are they being remediated? Display my results in a table."
  // const socQuestions = "What kind of document is this? Who is the auditor? Is the audit period within the past year? What is the scope? List which trust principles are covered in the report, if any. List any exceptions and findings from the report. If there are findings, are they being remediated? Display my results in a table."

  const [file, setFile] = useState(undefined);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ docText: `${file} ${questions}` }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
     
      setResult(data.result);
      setLoading(false)
      //calling makeCSV here causes some kind of race condition
      // makeCSV()
      setStatus(false)
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  // async function handleDocChange(event) {
  //   event.preventDefault();
  //   setQuestions(event.target.value)
  //   console.log(questions)
  // }

  async function makeCSV() {
    let text = result
    // the text comes through all smooshed together, some sort of string to csv parser needed,
    // there's no consistency to the input
    let csvString = [text]
    let a = document.createElement('a');
    a.href = 'data:attachment/csv,' + csvString;
    a.target = '_blank';
    a.download = 'myFile.csv';
    document.body.appendChild(a);
    a.click();
  }
  
  useEffect(() => {
    let holder = document.getElementById('holder');

    holder.ondragover = function () {
      this.className = 'hover';
      return false;
    };

    holder.ondragend = function () {
      this.className = '';
      return false;
    };

    holder.ondrop = function (e) {
      this.className = '';
      e.preventDefault();

      let droppedFile = e.dataTransfer.files[0]
      setFileName(droppedFile.name)
      let reader = new FileReader()

      reader.onload = function (event) {
        event.preventDefault();
        setFile(event.target.result);
        setStatus(true);
      };

      console.log(droppedFile);
      reader.readAsText(droppedFile);

      return false;
    }
  },[])


  return (
    <div>
      <Head>
        <title>OpenAI Test Form</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/c.png" />
        <form onSubmit={onSubmit}>
          {/* <h2>1. Select the document type to analyze</h2>
          <select name="questions" value={questions} onChange={handleDocChange}>
            <option value={coiQuestions}>COI</option>
            <option value={penQuestions}>Pen Test</option>
            <option value={socQuestions}>SOC2</option>
          </select> */}
          {/* <br/> */}
          <h2>1. Enter your questions</h2>
          <input
            type="text"
            name="qs"
            placeholder="Enter questions"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
          <br />
          <h2>2. Drag a .txt file from your computer to the dropzone below.</h2>
          <article>
            <div
              id="holder"
              style={{border: "dashed 5px", padding: "5px"}}
            >
              Drop File Here
              {status && <li>{fileName}</li>}
            </div>
          </article>
          <br />
          <h2>3. Click the generate button to see your results.</h2>
          <input type="submit" value={loading ? "Retrieving Results" : "Get Results"} />
        </form>
        <div className={styles.result}>{result}</div>
        <br />
        <button onClick={makeCSV}>Download CSV</button>
      </main>
    </div>
  );
}
