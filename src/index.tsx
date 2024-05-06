/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import App from "./App";
import { Route, Router } from "@solidjs/router";
import { Movies } from "./routes/Movies";
import Database from "@tauri-apps/plugin-sql";
import { createResource } from "solid-js";

export const [db] = createResource(() => Database.load("sqlite:mngr.db"))

render(() => (
    <Router root={App}>
        <Route path="/" component={() => <p>Index</p>} />
        <Route path="/movies" component={Movies} load={async () => {
            const db = await Database.load("sqlite:mngr.db")
            const result =  await db.select("SELECT * FROM film");
            return result;
        }} />
        <Route path="/actors" component={() => <p>Actors</p>} />
        <Route path="/genres" component={() => <p>Genres</p>} />
        <Route path="/studios" component={() => <p>Studios</p>} />
    </Router>
), document.getElementById("root") as HTMLElement);


