const loading = document.getElementById("loading");
const programs = document.getElementById("programs");
const codePreview = document.getElementById("code-preview");
const closePreview = document.getElementById("close-preview");
const codeContent = document.getElementById("code-content");

const loadPrograms = async () => {
  loading.style.display = "block";

  try {
    const response = await fetch(
      "https://api.github.com/repos/cqb13/ti-programs/contents/programs"
    );
    const data = await response.json();

    for (const userDirectory of data) {
      if (userDirectory.type === "dir") {
        const userResponse = await fetch(userDirectory.url);
        const userFolders = await userResponse.json();

        for (const programFolder of userFolders) {
          if (programFolder.type === "dir") {
            const programResponse = await fetch(programFolder.url);
            const programFiles = await programResponse.json();

            let name = "";
            let download_url = "";
            let txt_file_url = "";
            let description = "";

            for (const file of programFiles) {
              if (file.name.endsWith(".8xp")) {
                download_url = file.download_url;
              } else if (file.name.endsWith(".txt")) {
                txt_file_url = file.url;
              } else if (file.name === "about.md") {
                const aboutResponse = await fetch(file.download_url);

                const aboutText = await aboutResponse.text();

                const aboutLines = aboutText.split("\n");

                let descriptionLines = [];
                let descriptionStarted = false;
                for (const line of aboutLines) {
                  if (line.startsWith("# ")) {
                    name = line.substring(2);
                    descriptionStarted = true;
                    continue;
                  }

                  if (line.startsWith("#")) {
                    descriptionStarted = false;
                  }

                  if (descriptionStarted && line != "") {
                    descriptionLines.push(line);
                  }
                }

                description = descriptionLines.join(" ");
              }
            }

            const programCard = createProgramCard(
              name,
              description,
              download_url,
              txt_file_url
            );
            programs.appendChild(programCard);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading programs:", error);
  } finally {
    loading.style.display = "none";
  }
};

const createProgramCard = (name, description, download_url, txt_file_url) => {
  const programCard = document.createElement("div");
  programCard.classList.add("program-card");

  const h2 = document.createElement("h2");
  h2.textContent = name;

  const p = document.createElement("p");
  p.textContent = description;

  const div = document.createElement("div");

  const download = document.createElement("button");
  download.textContent = "Download";
  download.addEventListener("click", () => {
    window.location.href = download_url;
  });

  const view = document.createElement("button");
  view.textContent = "View Code";
  view.addEventListener("click", () => {
    openCodeViewModel(txt_file_url);
  });

  div.appendChild(download);
  div.appendChild(view);

  programCard.appendChild(h2);
  programCard.appendChild(p);
  programCard.appendChild(div);

  return programCard;
};

loadPrograms();

const openCodeViewModel = async (codeUrl) => {
  document.body.style.overflow = "hidden";
  codePreview.style.display = "flex";

  const response = await fetch(codeUrl);
  const data = await response.json();
  const encodedContent = data.content;
  // content is base64 encoded
  const decodedContent = atob(encodedContent);
  codeContent.textContent = decodedContent;
};

closePreview.addEventListener("click", () => {
  closeCodeViewModel();
});

codePreview.addEventListener("click", (e) => {
  if (e.target === codePreview) {
    closeCodeViewModel();
  }
});

const closeCodeViewModel = () => {
  document.body.style.overflow = "auto";
  codePreview.style.display = "none";
};
