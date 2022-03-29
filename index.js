var holder = document.getElementById('holder');
var state = document.getElementById('status');

var instructions = document.getElementById('instructions')
var data_container = document.getElementById('data-container')
var result_container = document.getElementById('results-container')

var file_cnt = 0
var max_results = 3

var category_results = {}
var ids = []

var place_str = [
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th'
]

if (typeof window.FileReader === 'undefined') {
    state.className = 'fail';
} else {
    state.className = 'success';
    state.innerHTML = '✓ File API & FileReader available';
}

holder.ondragover = function() {
    this.className = 'hover';
    return false;
};
holder.ondragend = function() {
    this.className = '';
    return false;
};
holder.ondrop = function(e) {
    this.className = '';
    e.preventDefault();

    for (let file of e.dataTransfer.files) {
        console.log(file)
        reader = new FileReader();
        reader.onload = function(event) {
            console.log(event.target);
            processContents(file, event.target.result)
        };
        console.log(file);
        reader.readAsText(file);
    }

    return false;
};

function processContents( file, contents ) {
    file_cnt += 1
    var lines = contents.split('\n')

    // get categories
    var _categories = []
    {
        let _lines = lines[0].split(',')
        for (let i=1; i < _lines.length; i++) {
            _categories.push(_lines[i].trim())
        }

        // add categories to main
        for (i in _categories) {
            if (!(_categories[i] in category_results)) {
                category_results[_categories[i]] = {}
            }
        }
    }

    lines.shift() // remove categories line

    // get votes
    for (let line of lines) {
        var lineDiv = document.createElement('div')
        lineDiv.innerText = line
        

        let parts = line.split(',')

        var id = null
        if (parts.length > 1) {
            id = parts[0]
        }

        if (ids.includes(id)) {
            continue;
        }

        data_container.appendChild( lineDiv )

        ids.push(id)
        
        for (let i=1; i < parts.length; i++) {
            var item = parts[i].trim()
            if (item == '') continue

            // add if doesn't exist
            if (!(item in category_results[_categories[i-1]])) {
                category_results[_categories[i-1]][item] = 0
            }

            // add vote
            category_results[_categories[i-1]][item] += 1
        }
    }

    update_results()
}

function update_results() {
    console.log(category_results)
    result_container.innerHTML = '' // clear

    // show results per category
    for (let key of Object.keys(category_results)) {

        let result_grp = document.createElement('div')
        result_grp.classList.add('result-container')

        let header = document.createElement('div')
        header.classList.add('result-category-header')
        header.innerText = key

        // get top 3
        let max = 3
        let max_counts = []
        var key_list = []

        for (let item of Object.keys(category_results[key])) {
            max_counts.push(category_results[key][item])
        }

        // remove duplicates
        max_counts = [...new Set(max_counts)]

        // sort ( highest first)
        max_counts.sort().reverse()

        // create winners list placeholder
        for (let i in max_counts) {
            key_list.push([])
        }

        console.log(key, 'max counts')
        console.log(max_counts)

        // get max keys
        for (let item of Object.keys(category_results[key])) {
            var val = category_results[key][item]
            let index = max_counts.indexOf(val)
            key_list[index].push(item)
        }

        // show results for category
        result_grp.appendChild(header)
        result_container.appendChild(result_grp)

        for (let i=0; i < max_results && i < max_counts.length; i++) {

            let winners = key_list[i].join(', ')
            let winnersDiv = document.createElement('div')
            winnersDiv.innerText = place_str[i] + ': ' + winners
            result_grp.appendChild(winnersDiv)
        }
    }

    instructions.innerHTML = ''
}