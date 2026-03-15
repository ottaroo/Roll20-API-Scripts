// ===== Main command: show menu or shift =====
on("chat:message", async function(msg) {
    if (msg.type !== "api") return;

    let args = msg.content.split(" ");

    if (args.length === 0) return;

    let command = args[0].toLowerCase();

    switch(command) {

        case "!wildshape-cancel":
            await cancelWildShape(msg);
            break;
        case "!wildshape-shift":
            await shiftWildShape(msg, args);
            break;
        case "!wildshape":
            await createWildShapeMenu(msg);
            break;
        case "!fixtoken":
            await fixToken(msg);
            break;
        case "!adjustsize":
            await adjustSize(msg, args);
            break;
        case "!resetsize":
            await resetSize(msg);
            break;
        case "!debug-token":
            let token = await getToken(msg);
            log(token);
            break;
        default:
            break;

    }
});


// ===== Helper: get default token for character ====
function getDefaultTokenAsync(charObj) {
    return new Promise(resolve => {
        charObj.get("defaulttoken", json => resolve(json));
    });
}

async function getToken(msg, selectedId = null) {
    if (!msg.selected || msg.selected.length === 0) {
        sendChat("WildShape", "/w " + msg.who + " No token selected.");
        return null;
    }
    let token = getObj("graphic", selectedId ?? msg.selected[0]._id);
    if (!token) return null;

    let pcChar = getObj("character", token.get("represents"));
    if (!pcChar) {
        sendChat("WildShape", "/w " + msg.who + " Selected token is not linked to a character.");
        return false;
    }

    // let isGm = playerIsGM(msg.playerid);
    // let tokenIsControlledBy = token.get("controlledby");
    // let allowedControl = isGm;
    // if (!allowedControl) {
    //     let controlledByArray = Array.isArray(tokenIsControlledBy) ? tokenIsControlledBy : [tokenIsControlledBy];
    //     for (let controlledBy of controlledByArray) {
    //         if (controlledBy === msg.playerid) {
    //             allowedControl = true;
    //             break;
    //         }
    //     }
    // }
    // if (!allowedControl) {
    //     sendChat("WildShape", "/w " + msg.who + " You do not have permission to use this token.");
    //     return null;
    // }
    return token;
}




async function createWildShapeMenu(msg) {
    const token = await getToken(msg);
    if (!token) return;

    let pcChar = getObj("character", token.get("represents"));
    let pcName = pcChar.get("name");
    let prefix = pcName + " - ";

    // Find all NPC sheets matching "<PC Name> - <Form>"
    let npcs = findObjs({ type: "character" })
        .filter(c => c.get("name").startsWith(prefix));

    if (npcs.length === 0) {
        sendChat("WildShape",
            "/w " + msg.who +
            " No Wild Shape forms found. Expected names like:<br>" +
            `"${pcName} - Bear" or "${pcName} - Tiger"`
        );
        return;
    }

    // Build menu
    let buttons = npcs.map(npc => {
        let formName = npc.get("name").substring(prefix.length);
        return "[" + formName + "](!wildshape-shift " + pcChar.id + " " + npc.id + " " + token.id + ")";
    }).concat([
        "[Cancel Wildshape](!wildshape-cancel)"
    ]);

    sendChat("WildShape",
        "/w " + msg.who +
        " Choose your Wild Shape:<br>" +
        buttons.join(" ")
    );
}


async function cancelWildShape(msg)
{
    const wsToken = await getToken(msg);
    if (!wsToken) return;

    let pc = findObjs({ type: "character" })
        .filter(c => c.get("name") === wsToken.get("name"))[0];

    const defaultTokenJSON = await getDefaultTokenAsync(pc);

    if (!defaultTokenJSON) {
        sendChat("WildShape", `/w ${msg.who} ERROR: PC '${pc.get("name")}' has no default token.`);
        return;
    }

    let dt;
    try {
        dt = JSON.parse(defaultTokenJSON);
    } catch {
        sendChat("WildShape", `/w ${msg.who} ERROR: Default token for '${pc.get("name")}' is corrupted.`);
        return;
    }

    if (!dt.imgsrc || dt.imgsrc.includes("thumb")) {
        sendChat("WildShape", `/w ${msg.who} ERROR: Default token for '${pc.get("name")}' has an invalid image.`);
        return;
    }

    // --- Clone token props ---
    let props = cloneTokenProps(wsToken);
    props.represents = pc.id;
    props.imgsrc = dt.imgsrc;
    props.width = dt.width || wsToken.get("width");
    props.height = dt.height || wsToken.get("height");

    // --- Create new token ---
    createObj("graphic", props);
    sendChat("WildShape", `/em transforms back into ${pc.get("name")}!`);
    wsToken.remove();
}

async function shiftWildShape(msg, args) {
    if (args.length < 4) return;

    let pcId = args[1];
    let npcId = args[2];
    let tokenId = args[3];

    let pcChar = getObj("character", pcId);
    let npcChar = getObj("character", npcId);
    let token = await getToken(msg);

    if (!pcChar || !npcChar || !token) return;
    if (token.id !== tokenId) return;

    if (!pcChar || pcChar.get("type") !== "character") { log("ERROR: Token is not linked to a character sheet"); return; }


    let pcName = pcChar.get("name");
    let pcSheet = findObjs({
        _type: "character",
        name: pcName
    })[0];

    await performWildShapeShift(pcChar, npcChar, token, msg.who);
}



async function performWildShapeShift(pcChar, npcChar, oldToken, who) {

    const pcId = pcChar.id;
    const npcId = npcChar.id;


    // --- Get default token ---
    const defaultTokenJSON = await getDefaultTokenAsync(npcChar);

    if (!defaultTokenJSON) {
        sendChat("WildShape", `/w ${who} ERROR: NPC '${npcChar.get("name")}' has no default token.`);
        return;
    }

    let dt;
    try {
        dt = JSON.parse(defaultTokenJSON);
    } catch {
        sendChat("WildShape", `/w ${who} ERROR: Default token for '${npcChar.get("name")}' is corrupted.`);
        return;
    }

    if (!dt.imgsrc || dt.imgsrc.includes("thumb")) {
        sendChat("WildShape", `/w ${who} ERROR: Default token for '${npcChar.get("name")}' has an invalid image.`);
        return;
    }

    // --- Clone token props ---
    let props = cloneTokenProps(oldToken);
    props.represents = pcId;
    props.imgsrc = dt.imgsrc;
    props.width = dt.width || oldToken.get("width");
    props.height = dt.height || oldToken.get("height");

    // --- Create new token ---
    createObj("graphic", props);

    sendChat("WildShape", `/em transforms into ${npcChar.get("name")}!`);

    oldToken.remove();
}

async function fixToken(msg) {

    if (!msg.selected || msg.selected.length === 0) {
        sendChat("TokenSetup", "/w " + msg.who + " No tokens selected.");
        return;
    }

    for(const sel of msg.selected){

        let token = await getToken(msg, sel._id);
        if (!token) continue;
        let represents = token.get("represents");
        let char = represents ? getObj("character", represents) : null;

        let characterSheet = getCharacterSheetAsJson(char.id);
        let darkvision = getDarkVision(characterSheet);

        // --- APPLY TOKEN SETTINGS ---
        token.set({
            showname: true,          // Nameplate ON
            showplayers_name: true,

            // Bars visible & editable
            showplayers_bar1: true,
            showplayers_bar2: true,
            showplayers_bar3: true,
            playersedit_bar1: true,
            playersedit_bar2: true,
            playersedit_bar3: true,
            bar1_link: "hp",
            bar2_link: "hp_temp",
            bar1_num_permission: "everyone",
            bar2_num_permission: "everyone",
            bar3_num_permission: "everyone",

            // Auras visible & editable
            showplayers_aura1: true,
            showplayers_aura2: true,
            playersedit_aura1: true,
            playersedit_aura2: true,

//            light_hassight: true,
//            has_night_vision: darkvision > 0,
//            night_vision_distance: darkvision

        });

    }

    sendChat("TokenSetup", "/w " + msg.who + " Token properties updated.");
}

function getCharacterSheetAsJson(characterId) {
    const store = findObjs({ type: 'attribute', characterid: characterId, name: 'store'})[0];

    if (!store) {
        throw new Error(`Character ${characterId} has no 'store' attribute.`);
    }
    return store.get("current");

}

function getDarkVision(characterJson) {
    let total = 0;
    let totalBase = 0;

    function walk(node) {
        if (node && typeof node === "object") {
            const type = node.type;
            const calc = node.calculation;

            const matchesAbility =
                typeof type === "string" &&
                type.toLowerCase() === "sense";

            const matchesCalc = calc === "Set Base" || calc === "Modify";

            if (matchesAbility && matchesCalc && node.name === "Darkvision") {
                const flatValue = node.valueFormula?.flatValue;
                if (typeof flatValue === "number") {
                    if (calc === "Set Base" && flatValue > totalBase) {
                        totalBase = flatValue;
                    }
                    else {
                        total += flatValue;
                    }
                }
            }

            for (const key in node) {
                walk(node[key]);
            }
        }
    }

    walk(characterJson);
    return total + totalBase;
}

async function adjustSize(msg, args) {

    if (!msg.selected || msg.selected.length === 0) {
        sendChat("TokenSetup", "/w " + msg.who + " No tokens selected.");
        return;
    }

    if (args.length < 2) {
        sendChat("TokenSetup", "/w " + msg.who + " Invalid arguments. Usage: !adjustsize <T,S,M,L,H,G>");
        return;
    }
    
    let width = 70;
    let height = 70;
    
    switch (args[1].toLowerCase()) {
        case "t":
            width = 18;
            height = 18;
            break;
        case "s":
            width = 35;
            height = 35;
            break;
        case "m":
            width = 70;
            height = 70;
            break;
        case "l":
            width = 140;
            height = 140;
            break;
        case "h":
            width = 210;
            height = 210;
            break;
        case "g":
            width = 280;
            height = 280;
            break;
        case "c":
            width = 350;
            height = 350;
            break;
        default:
            break;
    }
    
    
    
    for (const sel of msg.selected) {

        let token = await getToken(msg, sel._id);
        if (!token) continue;

        
        token.set({
            width: width,
            height: height
        });
        
    }

}

async function resetSize(msg) {

    const wsToken = await getToken(msg);
    if (!wsToken) return;

    let pc = findObjs({ type: "character" })
        .filter(c => c.get("name") === wsToken.get("name"))[0];

    const defaultTokenJSON = await getDefaultTokenAsync(pc);
    let dt;
    try {
        dt = JSON.parse(defaultTokenJSON);
    } catch {
        sendChat("Adjustsize", `/w ${msg.who} ERROR: Default token for '${pc.get("name")}' is corrupted.`);
        return;
    }
    
    wsToken.set({
        width: dt.width,
        height: dt.height
    });
    
}

