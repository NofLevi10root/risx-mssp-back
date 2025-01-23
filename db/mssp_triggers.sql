
DROP TRIGGER IF EXISTS ToolsChange$$
CREATE TRIGGER ToolsChange BEFORE UPDATE ON tools
FOR EACH ROW
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION begin
		insert logtable values("Error in ToolsChange",now());
		SET @trigger_disabled = Null;
    end;
    IF @trigger_disabled IS NULL THEN
		SET @trigger_disabled = TRUE;
		insert logtable values("start Tools table triger",now());
        UPDATE configjson SET config = JSON_SET(config,
            CONCAT("$.Modules.", NEW.Tool_name, ".Enable"), NEW.isActive,
            CONCAT("$.Modules.", NEW.Tool_name, ".ExpireDate"), NEW.threshold_time,
            CONCAT("$.Modules.", NEW.Tool_name, ".LastRunDate"), ifNull( NEW.LastRun,"1999-06-02 10:15:17")),
            lastupdated = now();
        SET @trigger_disabled = NULL;
        insert logtable values("end Tools table triger",now());
        else 	
			insert logtable values("cant start Tools table triger as other trigers are running",now());
    END IF;
END$$

DROP TRIGGER IF EXISTS ArtiffactChange$$
CREATE TRIGGER ArtiffactChange BEFORE UPDATE ON artifacts
FOR EACH ROW
BEGIN
	DECLARE toolName VARCHAR(240);
	DECLARE EXIT HANDLER FOR SQLEXCEPTION begin
		insert logtable values("Error in ArtiffactChange",now());
		SET @trigger_disabled = Null;
    end;
    IF @trigger_disabled IS NULL THEN
		insert logtable values("Start artifact table triger",now());
        SET @trigger_disabled = TRUE;
        SELECT Tool_name INTO toolName FROM tools WHERE tool_id = NEW.parent_id;
        UPDATE configjson SET config = JSON_SET(config,
            CONCAT("$.Modules.", toolName, ".SubModules.", NEW.Toolname, ".Enable"), NEW.isActive,
            CONCAT("$.Modules.", toolName, ".SubModules.", NEW.Toolname, ".ExpireDate"), NEW.threshold_time,
            CONCAT("$.Modules.", toolName, ".SubModules.", NEW.Toolname, ".LastRunDate"),ifNull( NEW.LastRun,"1999-06-02 10:15:17")),
            lastupdated = now();
        SET @trigger_disabled = NULL;
        insert logtable values("end artifact table triger",now());
		else 	
			insert logtable values("cant start artifact table triger as other trigers are running",now());
    END IF;
END$$

DROP TRIGGER IF EXISTS AssetChange$$
CREATE TRIGGER AssetChange BEFORE UPDATE ON all_resources
FOR EACH ROW
BEGIN

		DECLARE Toolss, Tool, typess, typr VARCHAR(4000);
        DECLARE ToolList, typelist JSON DEFAULT "[]";
        DECLARE i, z INT DEFAULT 0;
		DECLARE EXIT HANDLER FOR SQLEXCEPTION begin
			insert logtable values("Error in AssetChange",now());
			SET @trigger_disabled = Null;
		end;
    IF @trigger_disabled IS NULL THEN
        SET @trigger_disabled = TRUE;
        insert logtable values("Start all_resources table update triger",now());
        SELECT CAST(CONCAT('["', REPLACE(NEW.tools, ',', '","'), '"]') AS JSON) INTO Toolss;
        SELECT CAST(CONCAT('["', REPLACE(NEW.type, ',', '","'), '"]') AS JSON) INTO typess;

        WHILE i < JSON_LENGTH(Toolss) DO
            SELECT Tool_name FROM tools WHERE tool_id = JSON_EXTRACT(Toolss, CONCAT('$[', i, ']')) INTO Tool;
            SET ToolList = JSON_ARRAY_APPEND(ToolList, "$", Tool);
            SET i = i + 1;
        END WHILE;

        WHILE z < JSON_LENGTH(typess) DO
            SELECT resource_type_name FROM resource_type WHERE resource_type_id = JSON_EXTRACT(typess, CONCAT('$[', z, ']')) INTO typr;
            SET typelist = JSON_ARRAY_APPEND(typelist, "$", typr);
            SET z = z + 1;
        END WHILE;

        IF NOT (select json_contains_path(config ,"one",concat("$.ClientInfrastructure.Assets.",new.resource_id))
        from configjson) THEN
            UPDATE configjson SET config = JSON_SET(config, CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id)
            , JSON_OBJECT());
        END IF;

        UPDATE configjson SET config = JSON_SET(config,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetString"), NEW.resource_string,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetEnable"), NEW.monitoring LIKE 1,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetType"), typelist,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetModules"), ToolList,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetParentId"), NEW.parent_id	,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".LastRunDate"), ifNull(new.checked,"1999-06-02 10:15:17")),
            lastupdated = now();
        SET @trigger_disabled = NULL;
        insert logtable values("End all_resources table update triger",now());
		else 	
			insert logtable values("cant start asset table update triger as other trigers are running",now());
    END IF;
END$$



DROP TRIGGER IF EXISTS AssetAdd$$
CREATE TRIGGER AssetAdd BEFORE insert ON all_resources
FOR EACH ROW
BEGIN

		DECLARE Toolss, Tool, typess, typr VARCHAR(4000);
        DECLARE ToolList, typelist JSON DEFAULT "[]";
        DECLARE i, z INT DEFAULT 0;
		DECLARE EXIT HANDLER FOR SQLEXCEPTION begin
			insert logtable values("Error in AssetAdd",now());
			SET @trigger_disabled = Null;
		end;
    IF @trigger_disabled IS NULL THEN
        SET @trigger_disabled = TRUE;
        insert logtable values("Start all_resources table insert triger",now());
        SELECT CAST(CONCAT('["', REPLACE(NEW.tools, ',', '","'), '"]') AS JSON) INTO Toolss;
        SELECT CAST(CONCAT('["', REPLACE(NEW.type, ',', '","'), '"]') AS JSON) INTO typess;

        WHILE i < JSON_LENGTH(Toolss) DO
            SELECT Tool_name FROM tools WHERE tool_id = JSON_EXTRACT(Toolss, CONCAT('$[', i, ']')) INTO Tool;
            SET ToolList = JSON_ARRAY_APPEND(ToolList, "$", Tool);
            SET i = i + 1;
        END WHILE;

        WHILE z < JSON_LENGTH(typess) DO
            SELECT resource_type_name FROM resource_type WHERE resource_type_id = JSON_EXTRACT(typess, CONCAT('$[', z, ']')) INTO typr;
            SET typelist = JSON_ARRAY_APPEND(typelist, "$", typr);
            SET z = z + 1;
        END WHILE;

        IF NOT (select json_contains_path(config ,"one",concat("$.ClientInfrastructure.Assets.",new.resource_id)) from configjson) THEN
            UPDATE configjson SET config = JSON_SET(config, CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id), JSON_OBJECT());
        END IF;

        UPDATE configjson SET config = JSON_SET(config,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetString"), NEW.resource_string,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetEnable"), NEW.monitoring LIKE 1,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetType"), typelist,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetModules"), ToolList,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".AssetParentId"), NEW.parent_id,
            CONCAT("$.ClientInfrastructure.Assets.", NEW.resource_id, ".LastRunDate"), ifNull(new.checked,"1999-06-02 10:15:17")),
            lastupdated = now();
        SET @trigger_disabled = NULL;
        insert logtable values("End all_resources table insert triger",now());
		else 	
			insert logtable values("cant start asset table insert triger as other trigers are running",now());
    END IF;
END$$



DROP TRIGGER IF EXISTS ChangeFromConfig$$
CREATE TRIGGER ChangeFromConfig AFTER UPDATE ON configjson
FOR EACH ROW
BEGIN

	DECLARE json, jsonAsset, Assets, Asset, products, product, submods, submod ,AssetModulesList,AssetTypeList VARCHAR(4000);
    declare ToolList,typelist json default "[]";
	DECLARE i, z, q,w INT DEFAULT 0;
	DECLARE EXIT HANDLER FOR SQLEXCEPTION begin
		insert logtable values("Error in ChangeFromConfig",now());
		SET @trigger_disabled = Null;
	end;
    IF @trigger_disabled IS NULL THEN
        SET @trigger_disabled = TRUE;
		insert logtable values("JSON Trigger Start",now());
        SELECT JSON_EXTRACT(config, "$.Modules") INTO json FROM configjson;
        SELECT JSON_KEYS(json) INTO products;

        WHILE i < JSON_LENGTH(products) DO
            SELECT JSON_EXTRACT(config, CONCAT("$.Modules.", JSON_EXTRACT(products, CONCAT('$[', i, ']'))))
            INTO product FROM configjson;
            IF JSON_LENGTH(JSON_KEYS(JSON_EXTRACT(product, "$.SubModules"))) > 0 THEN
                SELECT JSON_KEYS(JSON_EXTRACT(product, "$.SubModules")) INTO submods;
                WHILE z < JSON_LENGTH(submods) DO
					

                    SELECT JSON_EXTRACT(config, CONCAT("$.Modules.", JSON_EXTRACT(products, CONCAT('$[', i, ']')),
                        ".SubModules.", JSON_EXTRACT(submods, CONCAT('$[', z, ']')))) INTO submod FROM configjson;
				
                    UPDATE artifacts SET isActive = JSON_EXTRACT(submod, "$.Enable"),
                        threshold_time = JSON_EXTRACT(submod, "$.ExpireDate"),
                        LastRun = cast(JSON_EXTRACT(submod, "$.LastRunDate") as datetime) 
                        WHERE artifact_id = JSON_EXTRACT(submod, "$.id");
                    SET z = z + 1;
                END WHILE;
                SET z = 0;
            END IF;

            UPDATE tools SET isActive = JSON_EXTRACT(product, "$.Enable"),
                threshold_time = JSON_EXTRACT(product, "$.ExpireDate"),
                LastRun = JSON_EXTRACT(product, "$.LastRunDate")
                WHERE tool_id = JSON_EXTRACT(product, "$.id");

            SET i = i + 1;
        END WHILE;

        SELECT JSON_EXTRACT(config, "$.ClientInfrastructure.Assets") INTO jsonAsset FROM configjson;
        SELECT JSON_KEYS(jsonAsset) INTO Assets;

        WHILE q < JSON_LENGTH(Assets) DO
            SELECT JSON_EXTRACT(jsonAsset, CONCAT("$.", JSON_EXTRACT(Assets, CONCAT('$[', q, ']')))) INTO Asset;
			select JSON_EXTRACT(asset,'$.AssetModules') into AssetModulesList;
			select JSON_EXTRACT(asset,'$.AssetType') into AssetTypeList;
            
            while w <JSON_LENGTH(AssetModulesList) do
				SET ToolList = JSON_ARRAY_APPEND(ToolList, "$", (SELECT tool_id from tools where
                Tool_name= JSON_EXTRACT(AssetModulesList, CONCAT('$[', w, ']'))));
				set w=w+1;
            end while;
            
            set w = 0 ; 
            
			while w <JSON_LENGTH(AssetTypeList) do
				SET typelist = JSON_ARRAY_APPEND(typelist, "$", (SELECT resource_type_id from resource_type where
                resource_type_name= JSON_EXTRACT(AssetTypeList, CONCAT('$[', w, ']'))));
				set w=w+1;
            end while;
            
            UPDATE all_resources SET monitoring = JSON_EXTRACT(Asset, "$.AssetEnable"),
                resource_string = JSON_UNQUOTE(JSON_EXTRACT(Asset, "$.AssetString")),
                parent_id = JSON_UNQUOTE(JSON_EXTRACT(Asset, "$.AssetParentId")),
                checked=JSON_EXTRACT(Asset, "$.LastRunDate"),
                type = (SELECT GROUP_CONCAT(item) FROM JSON_TABLE(typelist, "$[*]"
                    COLUMNS (rowid FOR ORDINALITY, item VARCHAR(300) PATH "$")) AS json_parsed1),
                tools = (SELECT GROUP_CONCAT(item) FROM JSON_TABLE(ToolList, "$[*]"
                    COLUMNS (rowid FOR ORDINALITY, item VARCHAR(300) PATH "$")) AS json_parsed)
                WHERE resource_id = JSON_EXTRACT(Assets, CONCAT('$[', q, ']'));
			SET w = 0;
            set ToolList = "[]";
            set typelist = "[]";
            SET q = q + 1;
        END WHILE;

        SET @trigger_disabled = NULL;
        insert logtable values("JSON Trigger End",now());
	else 
		insert logtable values("cant start config table triger as other trigers are running",now());  
	END IF;
END$$

DROP FUNCTION IF EXISTS ReturnArrayTool$$

create Function ReturnArrayTool
( stringLonf varchar(500)
)
     returns json
     DETERMINISTIC 
  begin
   DECLARE Toolss, Tool VARCHAR(4000);
     DECLARE ToolList JSON DEFAULT "[]";
        DECLARE i INT DEFAULT 0;
        SELECT CAST(CONCAT('["', REPLACE(stringLonf, ',', '","'), '"]') AS JSON) INTO Toolss;
        WHILE i < JSON_LENGTH(Toolss) DO
            SELECT Tool_name FROM tools WHERE tool_id = JSON_EXTRACT(Toolss, CONCAT('$[', i, ']')) INTO Tool;
            SET ToolList = JSON_ARRAY_APPEND(ToolList, "$", Tool);
            SET i = i + 1;
        END WHILE;
        return ToolList;
end$$   

DROP FUNCTION IF EXISTS ReturnArrayType$$

create Function ReturnArrayType
( stringLonf varchar(500)
)
     returns json
     DETERMINISTIC 
  begin
		DECLARE typess, typr VARCHAR(4000);
        DECLARE typelist JSON DEFAULT "[]";
        DECLARE  z INT DEFAULT 0;
        SELECT CAST(CONCAT('["', REPLACE(stringLonf, ',', '","'), '"]') AS JSON) INTO typess;
        WHILE z < JSON_LENGTH(typess) DO
            SELECT resource_type_name FROM resource_type WHERE resource_type_id = JSON_EXTRACT(typess, CONCAT('$[', z, ']')) INTO typr;
            SET typelist = JSON_ARRAY_APPEND(typelist, "$", typr);
            SET z = z + 1;
		END WHILE;
        return typelist;
end$$   

DROP PROCEDURE IF EXISTS addAllAssetsToConfig$$
create PROCEDURE addAllAssetsToConfig ()
  begin
  select parent_id from all_resources;
  select JSON_OBJECTagg(resource_id,JSON_OBJECT("AssetString",resource_string,"AssetParentId",all_resources.parent_id,
  "AssetModules",ReturnArrayTool(tools),"AssetType",ReturnArrayType(type),"AssetEnable",monitoring)) from all_resources;

  UPDATE configjson SET config = JSON_SET(config,
  "$.ClientInfrastructure.Assets", (select JSON_OBJECTagg(resource_id,JSON_OBJECT("AssetString",resource_string,
  "AssetParentId",parent_id,"AssetModules",ReturnArrayTool(tools),"AssetType",ReturnArrayType(type),
  "AssetEnable",monitoring,"LastRunDate",ifNull(checked,"1999-06-02 10:15:17"))) from all_resources));

  
  end$$   

