import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class BackstageApiCatalogUpdater {
    // API Specs path
    private static final Path PROVIDED_API = Paths.get("src/main/resources/api-specs/provided");
    private final static Path CONSUMED_API = Paths.get("src/main/resources/api-specs/consumed");
    // Backstage yaml files
    private final static Path CATALOG_INFO = Paths.get("catalog-info.yaml");
    private static final Path API_TEMPLATE = Paths.get(".github/templates/api-def.yaml");
    // File suffixes and extension
    private static final String API = "-api";
    private static final String DEF = "-def";
    private static final String YAML = ".yaml";
    private static final String DEF_YAML = DEF + YAML;
    private static final String API_YAML = API + YAML;
    private static final String API_DEF_YAML = API + DEF_YAML;
    // OpenApi Yaml fields
    private static final String INFO = "info";
    private static final String TITLE = "title";
    private static final String KIND = "kind";
    // Backstage Yam fields
    private static final String COMPONENT = "Component";
    private static final String METADATA = "metadata";
    private static final String NAME = "name";
    private static final String DESCRIPTION = "description";
    private static final String SPEC = "spec";
    private static final String DEFINITION = "definition";
    private static final String TEXT = "$text";
    private static final String CONSUMES_APIS = "consumesApis";
    private static final String PROVIDES_APIS = "providesApis";
    // Predicates
    private static final Predicate<Path> IS_API_YAML = p -> p.getFileName().toString().endsWith(API_YAML);
    
    // Yaml dumper options
    private static final DumperOptions OPTIONS = new DumperOptions();

    static {
        OPTIONS.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
    }

    public static void main(String[] args) throws IOException {
        validateProjectStructure();
        generateApiDefinitions();
        updateComponentApis();
    }

    private static void validateProjectStructure() {
        if (!Files.exists(PROVIDED_API)) {
            throw new IllegalStateException("Provided API folder not found.");
        }
        if (!Files.exists(CONSUMED_API)) {
            throw new IllegalStateException("Consumed API folder not found.");
        }
        if (!Files.exists(API_TEMPLATE)) {
            throw new IllegalStateException("API Def template is missing.");
        }
        if (!Files.exists(CATALOG_INFO)) {
            throw new IllegalStateException("Catalog Info file is missing.");
        }
    }

    private static void generateApiDefinitions() throws IOException {
        try (Stream<Path> pathStream = Files.walk(PROVIDED_API)) {
            List<Path> apiYamlFiles = pathStream.filter(Files::isRegularFile)
                    .filter(IS_API_YAML)
                    .toList();
            for (Path providedApi : apiYamlFiles) {
                String fileName = providedApi.getFileName().toString();
                String specName = fileName.substring(0, fileName.lastIndexOf('.'));
                String apiTitle = extractTitle(providedApi);
                if (apiTitle == null) {
                    System.err.printf("Failed to extract info:title from OpenApi yaml: %s%n", providedApi);
                    continue;
                }
                String apiName = toApiName(apiTitle);
                if (Files.exists(PROVIDED_API.resolve(apiName + DEF_YAML))) {
                    System.out.printf("API Def for %s already exist.%n", specName);
                    continue;
                }
                generateApiDefinition(providedApi, apiName, apiTitle, specName);
            }
        }
    }

    private static void generateApiDefinition(Path providedApi, String apiName, String apiTitle, String specName) throws IOException {
        try (InputStream inputStream = Files.newInputStream(API_TEMPLATE)) {
            Map<String, Object> apiDef = new Yaml().load(inputStream);
            Map<String, Object> metadata = getAndMap(apiDef, METADATA);
            metadata.put(NAME, apiName);
            metadata.put(DESCRIPTION, apiTitle);
            Map<String, Object> spec = getAndMap(apiDef, SPEC);
            Map<String, Object> definition = getAndMap(spec, DEFINITION);
            definition.put(TEXT, "./" + specName + YAML);

            Path output = providedApi.getParent().resolve(apiName + API_DEF_YAML);
            try (Writer writer = Files.newBufferedWriter(output)) {
                new Yaml(OPTIONS).dump(apiDef, writer);
            }
            System.out.printf("Generated API Def: %s%n", output);
        }
    }

    private static String extractTitle(Path apiYaml) throws IOException {
        try (InputStream input = Files.newInputStream(apiYaml)) {
            Map<String, Object> api = new Yaml().load(input);
            if (api != null && api.containsKey(INFO)) {
                Map<String, Object> info = getAndMap(api, INFO);
                Object title = info.get(TITLE);
                return Optional.ofNullable(title)
                        .map(Object::toString)
                        .orElse(null);
            }
        }
        return null;
    }

    private static String toApiName(String title) {
        return Pattern.compile("\\s+")
                .matcher(title.trim().toLowerCase())
                .replaceAll("-");
    }

    private static void updateComponentApis() throws IOException {
        List<Object> documents = new ArrayList<>();
        try (InputStream is = Files.newInputStream(CATALOG_INFO)) {
            Iterable<Object> iterable = new Yaml().loadAll(is);
            iterable.forEach(documents::add);
        }
        if (documents.isEmpty()) {
            System.err.println("Catalog Info is empty or invalid.");
            return;
        }
        Optional<Map<String, Object>> componentOptional = documents.stream()
                .map(BackstageApiCatalogUpdater::objectToMap)
                .filter(map -> map.containsKey(KIND) && map.get(KIND).equals(COMPONENT))
                .findFirst();
        if (componentOptional.isEmpty()) {
            System.err.println("Entity kind:Component not found in Catalog Info.");
            return;
        }
        Map<String, Object> component = componentOptional.get();
        Map<String, Object> spec = getAndMap(component, SPEC);
        updateConsumedApis(spec);
        updateProvidedApis(spec);

        Yaml outputYaml = new Yaml(OPTIONS);
        try (Writer writer = Files.newBufferedWriter(CATALOG_INFO)) {
            outputYaml.dump(component, writer);
            if (documents.size() > 1) {
                for (int i = 1; i < documents.size(); i++) {
                    Object doc = documents.get(i);
                    if (doc != null) {
                        writer.write("---\n");
                        outputYaml.dump(doc, writer);
                    }
                }
            }
        }
        System.out.println("Catalog Info updated successfully.");
    }

    private static void updateApis(Map<String, Object> spec, Path apiPath, String apiTag) throws IOException {
        try (Stream<Path> pathStream = Files.walk(apiPath)) {
            List<Path> apiYamlFiles = pathStream.filter(Files::isRegularFile)
                    .filter(IS_API_YAML)
                    .toList();
            List<String> apis = new ArrayList<>();
            for (Path api : apiYamlFiles) {
                String apiTitle = extractTitle(api);
                if (apiTitle == null) {
                    System.err.printf("Failed to extract info:title from OpenApi yaml: %s%n", api);
                    continue;
                }
                apis.add(toApiName(apiTitle));
            }
            spec.put(apiTag, apis);
            System.out.printf("Updated %s: %s%n", apiTag, apis);
        }
    }


    private static void updateConsumedApis(Map<String, Object> spec) throws IOException {
        updateApis(spec, CONSUMED_API, CONSUMES_APIS);
    }

    private static void updateProvidedApis(Map<String, Object> spec) throws IOException {
        updateApis(spec, PROVIDED_API, PROVIDES_APIS);
    }

    public static Map<String, Object> objectToMap(Object obj) {
        return (Map<String, Object>) obj;
    }

    public static Map<String, Object> getAndMap(Map<String, Object> map, String key) {
        return objectToMap(map.get(key));
    }
}