/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";
import MainWindow from "./MainWindow";
import { Route, Router } from "@solidjs/router";
import Actors from "./routes/Actors";
import Studios from "./routes/Studios";
import { getActors, getFilms, getFilmsByActor, getFilmsByStudio, getFilmsByTag, getInaccessible, getStudios } from "./api/data";
import 'ag-grid-community/styles/ag-grid.css'; // grid core CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // optional theme
import { Movies } from "./routes/Movies";
import Inaccessible from "./routes/Inaccessible";
import { VideoPlayer } from "./components/VideoPlayer/VideoPlayer";
import { Home } from "./routes/Home";
import { Settings } from "./routes/Settings";
import { Convert } from "./routes/Convert";
import { DragDrop } from "./components/DragDrop";

render(() => (
    <Router  >
        <Route component={MainWindow}>
            <Route path="/" component={Home} />
            <Route path="/movies"  >
                <Route
                    path="/"
                    component={() => <Movies fetcher={() => getFilms()} />}
                    preload={void getFilms}
                />
                <Route
                    path="/tags/:tag"
                    component={(props) => <Movies fetcher={() => getFilmsByTag(props.params.tag)} />}
                    preload={(args) => getFilmsByTag(args.params.tag)}
                />
                <Route
                    path="/actors/:actorId"
                    component={props => <Movies fetcher={() => getFilmsByActor(Number(props.params.actorId))} />}
                    preload={(args) => getFilmsByActor(Number(args.params.actorId))}
                />
                <Route
                    path="/studios/:studioId"
                    component={props => <Movies fetcher={() => getFilmsByStudio(Number(props.params.studioId))} />}
                    preload={args => getFilmsByStudio(Number(args.params.studioId))}
                />
            </Route>
            <Route path={["/actors", "/movies/actors"]} component={Actors} preload={() => getActors()} />
            <Route path={["/studios", "/movies/studios"]} component={Studios} preload={() => getStudios()} />
            <Route path="/movies/inaccessible" component={Inaccessible} preload={() => getInaccessible()} />
            <Route path="/play" component={VideoPlayer} />
        </Route>
        <Route path="/settings" component={Settings} />
        <Route path="/convert" component={Convert} />
        <Route path="/dragdrop" component={DragDrop} />
    </Router>
), document.getElementById("root") as HTMLElement);


