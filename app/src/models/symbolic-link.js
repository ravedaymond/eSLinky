export class SymbolicLink {
    
    /**
     * 
     * @param {string} name 
     * @param {boolean} active 
     * @param {boolean} file 
     * @param {boolean} hard 
     * @param {boolean} junction 
     * @param {string} link 
     * @param {string} target 
     * @param {string} description 
     * @param {string[]} tags 
     */
    constructor(name, active, file, hard, junction, link, target, description, tags) {
        this.name = name;
        this.active = active;
        this.file = file;
        this.hard = hard;
        this.junction = junction;
        this.link = link;
        this.target = target;
        this.description = description;
        this.tags = tags;
    }

    static New(name) {
        return new SymbolicLink(name, false, false, false, false, '', '', '', []);
    }

    static PreExisting(file, hard, junction, link, target) {
        return new SymbolicLink(link, true, file, hard, junction, link, target, '', []);
    }

}
