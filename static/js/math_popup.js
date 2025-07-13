// Math Function Popup for Note Editor
// Shows a modal to insert LaTeX for common math functions

document.addEventListener('DOMContentLoaded', function() {
    // Only run if the math button exists
    const mathBtn = document.getElementById('math-btn');
    if (!mathBtn) return;

    // Create modal HTML if not present
    if (!document.getElementById('math-modal')) {
        const modal = document.createElement('div');
        modal.id = 'math-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
        <div class="math-modal-backdrop" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:1000;display:flex;align-items:center;justify-content:center;">
            <div class="math-modal-content" style="background:#fff;padding:24px 18px 12px 18px;border-radius:8px;min-width:320px;max-width:90vw;box-shadow:0 2px 16px #0002;position:relative;">
                <button id="math-modal-close" style="position:absolute;top:8px;right:8px;font-size:18px;background:none;border:none;">&times;</button>
                <h5 style="margin-top:0">Insert Math Function</h5>
                <label for="math-type">Type:</label>
                <select id="math-type" class="form-control" style="margin-bottom:10px;">
                    <option value="integral">Integral</option>
                    <option value="derivative">Derivative</option>
                    <option value="double_integral">Double Integral</option>
                    <option value="log">Logarithm</option>
                    <option value="sum">Summation</option>
                    <option value="frac">Fraction</option>
                    <option value="sqrt">Square Root</option>
                </select>
                <form id="math-fields"></form>
                <div style="margin-top:10px;text-align:right;">
                    <button type="button" id="math-insert-btn" class="btn btn-primary btn-sm">Insert</button>
                </div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    const modal = document.getElementById('math-modal');
    const closeBtn = modal.querySelector('#math-modal-close');
    const insertBtn = modal.querySelector('#math-insert-btn');
    const typeSelect = modal.querySelector('#math-type');
    const fieldsForm = modal.querySelector('#math-fields');

    // Field templates for each type
    const fieldTemplates = {
        integral: [
            {label:'Lower Limit', name:'lower', placeholder:'a', required:false},
            {label:'Upper Limit', name:'upper', placeholder:'b', required:false},
            {label:'Integrand', name:'integrand', placeholder:'f(x)', required:true},
            {label:'Variable', name:'var', placeholder:'dx', required:true}
        ],
        derivative: [
            {label:'Function', name:'func', placeholder:'f(x)', required:true},
            {label:'Variable', name:'var', placeholder:'x', required:true}
        ],
        double_integral: [
            {label:'Lower Limit', name:'lower', placeholder:'a', required:false},
            {label:'Upper Limit', name:'upper', placeholder:'b', required:false},
            {label:'Integrand', name:'integrand', placeholder:'f(x, y)', required:true},
            {label:'Variables', name:'var', placeholder:'dx\,dy', required:true}
        ],
        log: [
            {label:'Base', name:'base', placeholder:'e', required:false},
            {label:'Argument', name:'arg', placeholder:'x', required:true}
        ],
        sum: [
            {label:'Lower Index', name:'lower', placeholder:'i=1', required:false},
            {label:'Upper Index', name:'upper', placeholder:'n', required:false},
            {label:'Expression', name:'expr', placeholder:'a_i', required:true}
        ],
        frac: [
            {label:'Numerator', name:'num', placeholder:'a', required:true},
            {label:'Denominator', name:'den', placeholder:'b', required:true}
        ],
        sqrt: [
            {label:'Radicand', name:'rad', placeholder:'x', required:true}
        ]
    };

    function renderFields(type) {
        fieldsForm.innerHTML = '';
        fieldTemplates[type].forEach(f => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `<label>${f.label}${f.required ? ' *' : ''}</label><input class="form-control" name="${f.name}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''}>`;
            fieldsForm.appendChild(div);
        });
    }

    function buildLatex(type, data) {
        switch(type) {
            case 'integral': {
                let lim = '';
                if (data.lower && data.upper) lim = `_{${data.lower}}^{${data.upper}}`;
                else if (data.lower) lim = `_{${data.lower}}`;
                else if (data.upper) lim = `^{${data.upper}}`;
                return `\\int${lim} ${data.integrand} \\;${data.var}`;
            }
            case 'derivative':
                return `\\frac{d}{d${data.var}} ${data.func}`;
            case 'double_integral': {
                let lim = '';
                if (data.lower && data.upper) lim = `_{${data.lower}}^{${data.upper}}`;
                else if (data.lower) lim = `_{${data.lower}}`;
                else if (data.upper) lim = `^{${data.upper}}`;
                return `\\iint${lim} ${data.integrand} \\;${data.var}`;
            }
            case 'log':
                return data.base ? `\\log_{${data.base}} ${data.arg}` : `\\log ${data.arg}`;
            case 'sum': {
                let lim = '';
                if (data.lower && data.upper) lim = `_{${data.lower}}^{${data.upper}}`;
                else if (data.lower) lim = `_{${data.lower}}`;
                else if (data.upper) lim = `^{${data.upper}}`;
                return `\\sum${lim} ${data.expr}`;
            }
            case 'frac':
                return `\\frac{${data.num}}{${data.den}}`;
            case 'sqrt':
                return `\\sqrt{${data.rad}}`;
            default:
                return '';
        }
    }

    // Show modal
    mathBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
        renderFields(typeSelect.value);
    });
    // Hide modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    modal.querySelector('.math-modal-backdrop').addEventListener('click', function(e) {
        if (e.target === this) modal.style.display = 'none';
    });
    // Change fields on type change
    typeSelect.addEventListener('change', function() {
        renderFields(this.value);
    });
    // Insert LaTeX
    insertBtn.addEventListener('click', function() {
        const type = typeSelect.value;
        const formData = new FormData(fieldsForm);
        const data = {};
        for (const [k, v] of formData.entries()) data[k] = v;
        // Validate required
        for (const f of fieldTemplates[type]) {
            if (f.required && !data[f.name]) {
                fieldsForm.querySelector(`[name='${f.name}']`).focus();
                return;
            }
        }
        const latex = buildLatex(type, data);
        // Insert as display math if block, inline otherwise
        let latexInsert = '';
        if (["integral","double_integral","sum"].includes(type)) {
            latexInsert = `$$${latex}$$`;
        } else {
            latexInsert = `\\(${latex}\\)`;
        }
        // Always insert at the end
        let inserted = false;
        if (window.Quill && window.quill) {
            const quill = window.quill;
            const length = quill.getLength();
            quill.insertText(length - 1, latexInsert); // -1 to avoid inserting after the trailing newline
            quill.setSelection(length - 1 + latexInsert.length, 0);
            inserted = true;
        }
        // Fallback: insert at end of textarea
        if (!inserted) {
            const textarea = document.querySelector('textarea[name="content"]');
            if (textarea) {
                textarea.value += latexInsert;
                textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                textarea.focus();
            }
        }
        modal.style.display = 'none';
    });
});
