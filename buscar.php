<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'config/database.php';

if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
    echo json_encode(['error' => 'Término de búsqueda vacío']);
    exit;
}

$searchTerm = trim($_GET['q']);
$database = new Database();
$db = $database->getConnection();

try {
    // Dividir en palabras y buscar cada una
    $words = preg_split('/\s+/', $searchTerm);
    $words = array_filter($words); // Eliminar elementos vacíos
    
    // Si hay múltiples palabras, buscar por cada una
    if (count($words) > 1) {
        $conditions = [];
        $params = [];
        
        // Primera palabra puede ser nombre o apellido
        $conditions[] = "(Nombres LIKE :word0 OR Apellidos LIKE :word0)";
        $params[':word0'] = "%{$words[0]}%";
        
        // Segunda palabra puede ser nombre o apellido
        $conditions[] = "(Nombres LIKE :word1 OR Apellidos LIKE :word1)";
        $params[':word1'] = "%{$words[1]}%";
        
        $whereClause = implode(' AND ', $conditions);
        
        $query = "SELECT * FROM jurados 
                  WHERE {$whereClause}
                  LIMIT 10";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
    } else {
        // Si solo hay una palabra, búsqueda normal
        $query = "SELECT * FROM jurados 
                  WHERE Nombres LIKE :search 
                     OR Apellidos LIKE :search 
                  LIMIT 10";
        
        $stmt = $db->prepare($query);
        $searchPattern = "%{$searchTerm}%";
        $stmt->bindParam(':search', $searchPattern);
    }
    
    $stmt->execute();
    
    $jurados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($jurados) === 0) {
        echo json_encode(['jurados' => []]);
        exit;
    }
    
    // Para cada jurado, buscar su notario
    foreach ($jurados as &$jurado) {
        if (isset($jurado['CodigoMesa'])) {
            $notarioQuery = "SELECT * FROM notarios 
                             WHERE Cod_Mesa = :codigoMesa 
                             LIMIT 1";
            
            $notarioStmt = $db->prepare($notarioQuery);
            $notarioStmt->bindParam(':codigoMesa', $jurado['CodigoMesa']);
            $notarioStmt->execute();
            
            $notario = $notarioStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($notario) {
                $jurado['notario'] = $notario;
            } else {
                $jurado['notario'] = null;
            }
        } else {
            $jurado['notario'] = null;
        }
    }
    
    echo json_encode(['jurados' => $jurados]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>