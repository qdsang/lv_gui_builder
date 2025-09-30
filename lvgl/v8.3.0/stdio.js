
let stdio = {out: null};


export function register(output) {
    // function({data: ''})
    stdio.out = output;
}

export function out(str) {
    if (stdio.out) stdio.out({data: str});
}

export default {
    register,
    out
}
