function openApp(){
  document.getElementById('app').style.display='block';
  document.body.style.overflow='hidden';
}

function closeApp(){
  document.getElementById('app').style.display='none';
  document.body.style.overflow='auto';
}

document.getElementById('assessment').addEventListener('submit', async function(e){
  e.preventDefault();

  const country = document.getElementById('country').value;
  const budget = document.getElementById('budget').value;
  const goal = document.getElementById('goal').value;
  const skills = document.getElementById('skills').value;

  const r = document.getElementById('result');

  r.style.display = 'block';
  r.innerHTML = '🤖 Creating your personalized AI roadmap...';

  try {
    const response = await fetch(
      'https://bizpilot-ai.nihathasan053.workers.dev',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          country,
          budget,
          goal,
          skills
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'AI request failed');
    }

    r.innerHTML = `
      <strong>Your AI Business Roadmap</strong>
      <br><br>
      ${data.answer.replace(/\n/g, '<br>')}
    `;

  } catch (error) {
    r.innerHTML = `
      <strong>Something went wrong.</strong>
      <br><br>
      ${error.message}
    `;
  }

  r.scrollIntoView({
    behavior:'smooth',
    block:'nearest'
  });
});

window.addEventListener('click', function(e){
  if(e.target.id === 'app'){
    closeApp();
  }
});
