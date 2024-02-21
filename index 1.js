document.getElementById('createBranchForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const branchName = document.getElementById('branchNameInput').value;
    const filePath = document.getElementById('filePath').value;

    try {
        // Retrieve information about the main branch
        const mainBranchInfo = await fetchMainBranchInfo();
        if (!mainBranchInfo.ok) {
            throw new Error('Failed to fetch main branch information');
        }

        const mainBranchData = await mainBranchInfo.json();
        const mainBranchSHA = mainBranchData.commit.sha;

        // Call function to create a new branch
        createBranch(branchName, filePath, mainBranchSHA);
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
});

async function fetchMainBranchInfo() {
    const repoOwner = 'Mohit-TekwaniTR';
    const repoName = 'mohit-test';
    const token = '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';

    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/branches/main`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
}

async function createBranch(branchName, filePath, mainBranchSHA) {
    const repoOwner = 'Mohit-TekwaniTR';
    const repoName = 'mohit-test';
    const token = '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';

    try {
        // Create a new branch with the updated SHA of the main branch
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: mainBranchSHA
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create new branch');
        }

        alert(`Created new branch: ${branchName}`);

        // Trigger workflow and create codespace
        triggerWorkflowAndCreateCodespace(branchName, filePath);
    } catch (error) {
        console.error('Error creating new branch:', error);
        alert('Error: ' + error.message);
    }
}

async function triggerWorkflowAndCreateCodespace(branchName, filePath) {
    const repoOwner = 'Mohit-TekwaniTR';
    const repoName = 'mohit-test';
    const token = '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';
    const workflowName = 'codespace-workflow.yml';

    // Trigger GitHub Actions workflow
    const workflowDispatchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowName}/dispatches`;
    const workflowDispatchBody = {
        ref: branchName,
        inputs: {
            dynamic_path: filePath
        }
    };
    const workflowDispatchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workflowDispatchBody)
    };

    try {
        const workflowDispatchResponse = await fetch(workflowDispatchUrl, workflowDispatchOptions);
        if (!workflowDispatchResponse.ok) {
            throw new Error('Failed to trigger GitHub Actions workflow: ' + workflowDispatchResponse.statusText);
        }

        // Create codespace
        const createCodespaceUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/codespaces`;
        const createCodespaceBody = {
            ref: branchName,
            machine: 'standardLinux32gb'
        };
        const createCodespaceOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(createCodespaceBody)
        };

        const createCodespaceResponse = await fetch(createCodespaceUrl, createCodespaceOptions);
        if (!createCodespaceResponse.ok) {
            throw new Error('Failed to create codespace: ' + createCodespaceResponse.statusText);
        }

        // Open codespace URL in a new tab
        const createCodespaceData = await createCodespaceResponse.json();
        window.open(createCodespaceData.web_url, '_blank');
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}
