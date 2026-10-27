import React from "react";
import { Composition, Folder } from "remotion";
import film from "../film.json";
import { SCENE_COMPONENTS } from "./scenes";
import { SCENES, TOTAL_FRAMES } from "./timing";
import { Video } from "./Video";

// "Film" is the whole film (rendered by npm run render). The folder "Scenes" has one
// composition per scene (scene-s01, ...), for the preview and for script/stills.mjs.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Video} durationInFrames={TOTAL_FRAMES} fps={film.fps} width={film.width} height={film.height} />
    <Folder name="Scenes">
      {SCENES.filter((sc) => SCENE_COMPONENTS[sc.id]).map((sc) => (
        <Composition key={sc.id} id={`scene-${sc.id}`} component={SCENE_COMPONENTS[sc.id]} durationInFrames={sc.frames} fps={film.fps} width={film.width} height={film.height} />
      ))}
    </Folder>
  </>
);
