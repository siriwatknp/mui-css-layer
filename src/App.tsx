import createCache, { StylisPlugin } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { Stack } from "@mui/material";
import Button from "@mui/material/Button";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const wrapInLayer: (layerName: string) => StylisPlugin =
  (layerName) => (node) => {
    // if we're not at the root of a <style> tag, leave the tree intact
    // if the node is an @layer rule, leave it intact
    if (node.root || node.type === "@layer") return;

    // if we're at the root, replace node with `@layer layerName { node }`
    const child = { ...node, parent: node, root: node };
    Object.assign(node, {
      children: [child],
      length: 6,
      parent: null,
      props: [layerName],
      return: "",
      root: null,
      type: "@layer",
      value: `@layer ${layerName}`,
    });
  };

let insertionPoint = document.querySelector('[name="emotion-insertion-point"]');
if (!insertionPoint) {
  insertionPoint = document.createElement("meta");
  insertionPoint.setAttribute("name", "emotion-insertion-point");
  insertionPoint.setAttribute("content", "");
  const head = document.querySelector("head");
  if (head) {
    head.prepend(insertionPoint);
  }
}

const cache = createCache({
  key: "css",
  stylisPlugins: [wrapInLayer("components")],
  insertionPoint: insertionPoint as HTMLMetaElement,
});

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: { light: true, dark: true },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.applyStyles("dark", {
            color: "red",
            background: "salmon",
          }),
      },
    },
  },
});

function App() {
  return (
    <CacheProvider value={cache}>
      <Stack spacing={2} direction="row">
        <ThemeProvider theme={theme} defaultMode="dark">
          <Button
            sx={{
              "@layer utilities": {
                color: "green",
                background: "lightgreen",
              },
            }}
          >
            Hello
          </Button>
          <Button>Hello</Button>
        </ThemeProvider>
      </Stack>
    </CacheProvider>
  );
}

export default App;
