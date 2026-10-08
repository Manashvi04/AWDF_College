import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";
import Footer from "../components/Footer";

function Home() {
  const skillList = ["HTML", "CSS", "JavaScript", "React"];

  return (
    <div className="container">
      <div className="card">
        <Header header="Student Portfolio" />
      </div>

      <div className="card">
        <About />
      </div>

      <div className="card">
        <h2>Skills</h2>
        <Skills skillList={skillList} />
      </div>

      <div className="card">
        <Footer />
      </div>
    </div>
  );
}

export default Home;
