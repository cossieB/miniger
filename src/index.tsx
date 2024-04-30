/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import App from "./App";
import { Route, Router } from "@solidjs/router";

render(() => (
    <Router root={App}>
        <Route path="/" component={() => <p>Index</p>} />
        <Route path="/movies" component={() => <p>Movies</p>} />
        <Route path="/actors" component={() => <p>Actors</p>} />
        <Route path="/genres" component={() => <p>Genres</p>} />
        <Route path="/studios" component={() => <p>Studios</p>} />
    </Router>
), document.getElementById("root") as HTMLElement);
