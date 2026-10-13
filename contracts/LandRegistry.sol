// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract LandRegistry {
    enum LandStatus {
        AKTIF,
        SENGKETA,
        DIBATALKAN
    }

    struct Land {
        uint256 id;
        string coordinates;
        uint256 area;
        address owner;
        LandStatus status;
        uint256 registeredAt;
        address[] history;
        string[] documentHashes;
    }

    address public admin;
    mapping(address => bool) public notaries;
    mapping(uint256 => Land) private lands;
    uint256 private landCounter;

    uint256 private constant MAX_VERTICES = 200;

    event LandRegistered(uint256 indexed landId, address indexed owner, string coordinates);
    event OwnershipTransferred(uint256 indexed landId, address indexed oldOwner, address indexed newOwner);
    event LandDocumentAdded(uint256 indexed landId, string ipfsHash);
    event NotaryRegistered(address indexed notary);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    modifier landExists(uint256 _landId) {
        require(_landId > 0 && _landId <= landCounter, "land does not exist");
        _;
    }

    modifier ownerOrNotary(uint256 _landId) {
        require(lands[_landId].owner == msg.sender || notaries[msg.sender], "only owner or notary");
        _;
    }

    function registerLand(string memory _coordinates, uint256 _area, address _owner) public onlyAdmin {
        require(_owner != address(0), "owner required");
        require(_area > 0, "area required");

        int256[] memory candidate = _parseCoordinates(_coordinates);
        for (uint256 id = 1; id <= landCounter; id++) {
            require(
                !_polygonsOverlap(candidate, _parseCoordinates(lands[id].coordinates)),
                "parcel overlaps an existing parcel"
            );
        }

        landCounter++;
        Land storage land = lands[landCounter];
        land.id = landCounter;
        land.coordinates = _coordinates;
        land.area = _area;
        land.owner = _owner;
        land.status = LandStatus.AKTIF;
        land.registeredAt = block.timestamp;
        land.history.push(_owner);

        emit LandRegistered(landCounter, _owner, _coordinates);
    }

    function addLandDocument(uint256 _landId, string memory _ipfsHash) public landExists(_landId) {
        require(msg.sender == admin || lands[_landId].owner == msg.sender, "only admin or land owner");
        require(bytes(_ipfsHash).length > 0, "document hash required");

        lands[_landId].documentHashes.push(_ipfsHash);

        emit LandDocumentAdded(_landId, _ipfsHash);
    }

    function registerNotary(address _notaryAddress) public onlyAdmin {
        require(_notaryAddress != address(0), "notary required");
        require(!notaries[_notaryAddress], "notary already registered");

        notaries[_notaryAddress] = true;

        emit NotaryRegistered(_notaryAddress);
    }

    function getLandDetails(uint256 _landId) public view landExists(_landId) returns (Land memory) {
        return lands[_landId];
    }

    function getLandOwner(uint256 _landId) public view landExists(_landId) returns (address) {
        return lands[_landId].owner;
    }

    function getLandDocuments(uint256 _landId) public view landExists(_landId) returns (string[] memory) {
        return lands[_landId].documentHashes;
    }

    function isLandDisputed(uint256 _landId) public view landExists(_landId) returns (bool) {
        return lands[_landId].status == LandStatus.SENGKETA;
    }

    function getTotalRegisteredLands() public view returns (uint256) {
        return landCounter;
    }

    function transferOwnership(uint256 _landId, address _newOwner) public landExists(_landId) ownerOrNotary(_landId) {
        Land storage land = lands[_landId];
        require(land.status != LandStatus.DIBATALKAN, "registration revoked");
        require(_newOwner != address(0), "new owner required");
        require(_newOwner != land.owner, "new owner must differ from current owner");

        address previousOwner = land.owner;
        land.owner = _newOwner;
        land.history.push(_newOwner);

        emit OwnershipTransferred(_landId, previousOwner, _newOwner);
    }

    function updateLandStatus(uint256 _landId, uint8 _status) public onlyAdmin landExists(_landId) {
        require(_status <= uint8(LandStatus.DIBATALKAN), "unknown status");

        lands[_landId].status = LandStatus(_status);
    }

    function updateLandArea(uint256 _landId, uint256 _newArea) public onlyAdmin landExists(_landId) {
        require(_newArea > 0, "area required");

        lands[_landId].area = _newArea;
    }

    function revokeLandRegistration(uint256 _landId) public onlyAdmin landExists(_landId) {
        require(lands[_landId].status != LandStatus.DIBATALKAN, "registration already revoked");

        lands[_landId].status = LandStatus.DIBATALKAN;
    }

    /// Coordinates arrive as "lat,lng;lat,lng;...", degrees scaled by 1e6, at least three points.
    function _parseCoordinates(string memory _coordinates) private pure returns (int256[] memory) {
        bytes memory raw = bytes(_coordinates);
        require(raw.length > 0, "coordinates required");

        int256[] memory buffer = new int256[](raw.length);
        int256 sign = 1;
        int256 value = 0;
        bool inNumber = false;
        bool hasDigit = false;
        uint256 count = 0;

        for (uint256 i = 0; i < raw.length; i++) {
            bytes1 char = raw[i];
            if (char == "," || char == ";") {
                require(hasDigit, "malformed coordinates");
                buffer[count++] = sign * value;
                sign = 1;
                value = 0;
                inNumber = false;
                hasDigit = false;
            } else if (char == "-" || char == "+") {
                require(!inNumber && !hasDigit, "malformed coordinates");
                sign = char == "-" ? int256(-1) : int256(1);
                inNumber = true;
            } else if (char >= "0" && char <= "9") {
                inNumber = true;
                hasDigit = true;
                value = value * 10 + int256(uint256(uint8(char) - 48));
            } else {
                revert("malformed coordinates");
            }
        }
        require(hasDigit, "malformed coordinates");
        buffer[count++] = sign * value;

        require(count % 2 == 0 && count >= 6, "at least 3 coordinate pairs required");
        require(count / 2 <= MAX_VERTICES, "too many vertices");

        int256[] memory points = new int256[](count);
        for (uint256 i = 0; i < count; i++) {
            points[i] = buffer[i];
        }
        return points;
    }

    function _polygonsOverlap(int256[] memory _a, int256[] memory _b) private pure returns (bool) {
        return _hasVertexInside(_a, _b) || _hasVertexInside(_b, _a) || _edgesCross(_a, _b);
    }

    function _hasVertexInside(int256[] memory _inner, int256[] memory _outer) private pure returns (bool) {
        uint256 vertices = _inner.length / 2;
        for (uint256 i = 0; i < vertices; i++) {
            if (_pointInPolygon(_inner[2 * i], _inner[2 * i + 1], _outer)) {
                return true;
            }
        }
        return false;
    }

    /// Ray casting. A point sitting exactly on an edge may be reported as outside, which is why
    /// the edge-crossing test runs too: shared borders count as an overlap either way.
    function _pointInPolygon(int256 _x, int256 _y, int256[] memory _polygon) private pure returns (bool) {
        bool inside = false;
        uint256 vertices = _polygon.length / 2;

        for (uint256 i = 0; i < vertices; i++) {
            uint256 j = (i + vertices - 1) % vertices;
            int256 xi = _polygon[2 * i];
            int256 yi = _polygon[2 * i + 1];
            int256 xj = _polygon[2 * j];
            int256 yj = _polygon[2 * j + 1];

            if ((yi > _y) != (yj > _y) && _x < ((xj - xi) * (_y - yi)) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    function _edgesCross(int256[] memory _a, int256[] memory _b) private pure returns (bool) {
        uint256 verticesA = _a.length / 2;
        uint256 verticesB = _b.length / 2;

        for (uint256 i = 0; i < verticesA; i++) {
            uint256 iNext = (i + 1) % verticesA;
            for (uint256 j = 0; j < verticesB; j++) {
                uint256 jNext = (j + 1) % verticesB;
                if (
                    _segmentsIntersect(
                        _a[2 * i],
                        _a[2 * i + 1],
                        _a[2 * iNext],
                        _a[2 * iNext + 1],
                        _b[2 * j],
                        _b[2 * j + 1],
                        _b[2 * jNext],
                        _b[2 * jNext + 1]
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function _segmentsIntersect(
        int256 _x1,
        int256 _y1,
        int256 _x2,
        int256 _y2,
        int256 _x3,
        int256 _y3,
        int256 _x4,
        int256 _y4
    ) private pure returns (bool) {
        int256 d1 = _orientation(_x3, _y3, _x4, _y4, _x1, _y1);
        int256 d2 = _orientation(_x3, _y3, _x4, _y4, _x2, _y2);
        int256 d3 = _orientation(_x1, _y1, _x2, _y2, _x3, _y3);
        int256 d4 = _orientation(_x1, _y1, _x2, _y2, _x4, _y4);

        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }
        if (d1 == 0 && _withinSegment(_x3, _y3, _x4, _y4, _x1, _y1)) return true;
        if (d2 == 0 && _withinSegment(_x3, _y3, _x4, _y4, _x2, _y2)) return true;
        if (d3 == 0 && _withinSegment(_x1, _y1, _x2, _y2, _x3, _y3)) return true;
        if (d4 == 0 && _withinSegment(_x1, _y1, _x2, _y2, _x4, _y4)) return true;

        return false;
    }

    function _orientation(
        int256 _ax,
        int256 _ay,
        int256 _bx,
        int256 _by,
        int256 _cx,
        int256 _cy
    ) private pure returns (int256) {
        return (_bx - _ax) * (_cy - _ay) - (_by - _ay) * (_cx - _ax);
    }

    function _withinSegment(
        int256 _ax,
        int256 _ay,
        int256 _bx,
        int256 _by,
        int256 _px,
        int256 _py
    ) private pure returns (bool) {
        return
            _px >= _min(_ax, _bx) &&
            _px <= _max(_ax, _bx) &&
            _py >= _min(_ay, _by) &&
            _py <= _max(_ay, _by);
    }

    function _min(int256 _a, int256 _b) private pure returns (int256) {
        return _a < _b ? _a : _b;
    }

    function _max(int256 _a, int256 _b) private pure returns (int256) {
        return _a > _b ? _a : _b;
    }
}
