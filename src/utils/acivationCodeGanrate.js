function generateCode(prefix, id) {
    console.log("id", id)
    return `${prefix}${id.toString().padStart(5, '0')}`; // Example: "TRS00001"
}

export default generateCode