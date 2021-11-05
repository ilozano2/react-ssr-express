import React from "react";
import App from "client/src/App";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import fs from "fs";
import { NextFunction, Request, Response } from "express";



/**
 * Options for the react ssr middleware.
 */
interface ReactMiddlewareOptions {
    /**
     * The absolute path for the html file where the rendered react main component will be rendered into. 
     */
    templateHtmlAbsolutePath: string;
}



/**
 * Creates a React Server Side Rendering middleware. Install it right after the static files middleware.
 * @param options options for this middleware.
 * @returns The react SSR middleware.
 */
export function reactMiddleware(options: ReactMiddlewareOptions) {

    console.log("react middlware instantiated.");

    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            
            // In SSR, using react-router-dom/BrowserRouter will throw an exception.
            // Instead, we use react-router-dom/server/StaticRouter.
            // In the client side, we still use BrowserRouter (see: client/src/Index.tsx)

            const WrappedApp = (
                <StaticRouter location={req.url}>
                    <App />
                </StaticRouter>
            );

            // renders the react application as html

            const reactContent = renderToString(WrappedApp);

            // read the static html file content

            const staticHtmlContent = await fs.promises.readFile(options.templateHtmlAbsolutePath, { encoding: "utf-8" });

            // finally, concat both the static html content with our react application content
            // this root div is defined in client/src/index.html

            //const renderedHtml = baseHtml.replace(`<div id="root"></div>`, `<div id="root">${reactContent}</div>`);
            const renderedHtml = staticHtmlContent.replace(`<div id="root"></div>`, `<div id="root">${reactContent}</div>`);

            res.set("content-type", "text/html").status(200).send(renderedHtml);

        }
        catch (error) {
            next(error);
        }
    
    }


}