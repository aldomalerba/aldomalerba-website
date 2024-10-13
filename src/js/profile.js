const profile = {
    "name": "Aldo",
    "surname": "Malerba",
    "age": 27,
    "profession": "Agile Software Developer",
    "education": [{
        "institution": "ITIS Benedetto Castelli",
        "course": "Computer Science and Telecomunications"
    }],
    "certifications": ["<a href='https://www.credly.com/badges/d2c988a8-8cfc-4cf8-bf75-7677bf084ee1/public_url'>AWS Certified Developer Associate</a>"],
    "workExperience" : [    {
        "companyName": "Claranet Italia",
        "role": "Agile Software Developer",
        "startYear": 2021,
        "endYear": null
    },{
        "companyName": "Regesta",
        "role": "Software Developer",
        "startYear": 2018,
        "endYear": 2021           
    }],
    "skills": ["Extreme Programming", "Scrum", "TDD", "Iterative and incremental development", "Java/Kotlin", "Javascript/Typescript", "others frameworks, languages, and tools", "feel free to reach out if you’d like to learn more!"]
};

const renderProfile = (id) => {
    const formattedJson = JSON.stringify(profile, null, 4)
    document.getElementById(id).innerHTML = `<pre><code>let profile = ${formattedJson}</code></pre>`;
}

renderProfile('json-profile')