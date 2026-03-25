const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/tasks.readonly';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export function initGoogleAPI(onReady: () => void, onAuthSuccess: () => void) {
  if (CLIENT_ID === 'MISSING_CLIENT_ID') {
    console.warn("Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
  }

  const checkReady = () => {
    if (gapiInited && gisInited) {
      onReady();
    }
  };

  if (!(window as any).gapi) {
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      (window as any).gapi.load('client', () => {
        (window as any).gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        }).then(() => {
          gapiInited = true;
          checkReady();
        });
      });
    };
    document.body.appendChild(script1);
  }

  if (!(window as any).google?.accounts) {
    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error !== undefined) {
            console.error(tokenResponse);
            return;
          }
          onAuthSuccess();
        },
      });
      gisInited = true;
      checkReady();
    };
    document.body.appendChild(script2);
  }
}

export function handleAuthClick() {
  if (!tokenClient) {
    alert("Google API not loaded yet. Or missing Client ID.");
    return;
  }
  tokenClient.requestAccessToken({prompt: 'consent'});
}

export async function fetchTasks() {
  try {
    const taskLists = await (window as any).gapi.client.tasks.tasklists.list({
      maxResults: 50,
    });
    
    if (!taskLists.result.items || taskLists.result.items.length === 0) return [];
    
    let allTasks: any[] = [];
    
    for (const list of taskLists.result.items) {
      const response = await (window as any).gapi.client.tasks.tasks.list({
        tasklist: list.id,
        maxResults: 100,
        showCompleted: false,
        showHidden: false,
      });
      
      if (response.result.items) {
        const tasksWithListName = response.result.items.map((t: any) => ({
          ...t,
          listName: list.title
        }));
        allTasks = allTasks.concat(tasksWithListName);
      }
    }
    
    return allTasks;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return [];
  }
}
